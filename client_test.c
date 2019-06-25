/*
 * Copyright (C)2019 liweibin. All rights reserved.
 */
/*
 * FileName: tcp_client.c
 *
 * Original Author: 545334649@qq.com, 2019-04-26
 *
 * Description:
 *  用TCP实现，作为客户端可以给服务器发送测试数据
 *
 * history
 *   v1.0
 *
 */

#include <stdio.h>				
#include <stdlib.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>
#include <string.h>
#include <resolv.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <errno.h>
#include <pthread.h>
#include "json.h"

#define PORT 9838
#define SERVER_IP  "35.240.164.245"

#define MAX_SIZE                1024
#define MAX_DEVICE_NAME_LEN     64

void Perror(char *str)
{
	perror(str);
	exit(1);
}

struct json_object *get_dev_data_obj(int type)
{
    struct json_object *json_data_obj;
    
    json_data_obj = json_object_new_object();
    if (json_data_obj == NULL) {
        printf("Create json data object failed.\n");
        return NULL;
    }

    json_object_object_add(json_data_obj, "dev_name", json_object_new_string("SN123"));
    json_object_object_add(json_data_obj, "num", json_object_new_int(14));

    return json_data_obj;
}

static void create_json_data(int cmd, unsigned char **server_buf, int *buf_len)
{
    //int i;
    int json_len;
    int err_flag;
    struct json_object *json_connect_obj;
    struct json_object *json_data_obj;

    *buf_len = 0;
    err_flag = 0;
    json_connect_obj = NULL;
    json_data_obj = NULL;
    
    json_connect_obj = json_object_new_object();
    if (json_connect_obj == NULL) {
        printf("json_connect_obj failed!\n");
        goto __JSON_OBJ_FREE;
    }
    
    if (cmd == 1) {
        json_data_obj = get_dev_data_obj(2);
        if (json_data_obj == NULL) {
            printf("get_dev_data_obj failed.\n");
            err_flag = 1;
            goto __RET_ERROR;
        }
    }
    
    json_object_object_add(json_connect_obj, "cmd", json_object_new_int(cmd));
    json_object_object_add(json_connect_obj, "code", json_object_new_int(0));
    json_object_object_add(json_connect_obj, "msg", json_object_new_string(""));
    json_object_object_add(json_connect_obj, "data", json_data_obj);

__RET_ERROR:
    if (err_flag == 1) {
        json_object_object_add(json_connect_obj, "code", json_object_new_int(-1));
        json_object_object_add(json_connect_obj, "msg", 
            json_object_new_string("Create json data object failed."));
        json_object_object_add(json_connect_obj, "data", json_object_new_string(""));
    }
    
    json_len = strlen(json_object_to_json_string(json_connect_obj)) + 2;
    
    *server_buf = (unsigned char *)malloc(MAX_SIZE);
    if (*server_buf == NULL) {
        Perror("malloc");
    }
    memset(*server_buf, 0, MAX_SIZE);
    
    (*server_buf)[0] = (char)((json_len & 0xff00) >> 8);
    (*server_buf)[1] = (char)(json_len & 0xff);
    (*server_buf)[2] = (char)((cmd & 0xff00) >> 8);
    (*server_buf)[3] = (char)(cmd & 0xff);
    memcpy(*server_buf + 4, (char *)json_object_to_json_string(json_connect_obj), json_len - 2);
    *buf_len = json_len + 2;
    
__JSON_OBJ_FREE:
    if (json_data_obj != NULL) {
        (void)json_object_put(json_data_obj);
    }

    if (json_connect_obj != NULL) {
        (void)json_object_put(json_connect_obj);
    }
    
    return;
}

static void send_connect_to_server(int sockfd)
{
    int i;
    int cmd = 1;
    int buf_len;
    unsigned char *server_buf;
    unsigned char client_buf[MAX_SIZE];
    
    create_json_data(cmd, &server_buf, &buf_len);
    printf("send online notice: head(%x %x %x %x), data(%s)\n", server_buf[0], server_buf[1], server_buf[2], server_buf[3], server_buf + 4);
    printf("online notice hex info:");
    for (i = 0; i < buf_len; i++) {
        printf("%02X ", server_buf[i]);
    }
    printf("\n");
    
    if (write(sockfd, (unsigned char *)server_buf, buf_len) < 0) {
        printf("write error, error(%s)\n", strerror(errno));
        Perror("write");
    }     
    
    free(server_buf);
    server_buf = NULL;
    
    memset(client_buf, 0, sizeof(client_buf));
    if (read(sockfd, (unsigned char *)client_buf, sizeof(client_buf)) < 0) {
        printf("write error, error(%s)\n", strerror(errno));
        Perror("write");
    }  
    
    printf("\nrecv online notice: head(%x %x %x %x), data(%s)\n", client_buf[0], client_buf[1], client_buf[2], client_buf[3], client_buf + 4);
}

int main(void)
{
	int sockfd;
	int connectfd;
	struct sockaddr_in my_sockaddr; 

	sockfd = socket(AF_INET, SOCK_STREAM, 0);
	if (sockfd < 0) {
		Perror("socket");
	}

	bzero(&my_sockaddr, sizeof(struct sockaddr_in));
	my_sockaddr.sin_family = AF_INET;
	my_sockaddr.sin_port = htons(PORT);
	inet_pton(AF_INET, SERVER_IP, &(my_sockaddr.sin_addr.s_addr));
	
	connectfd = connect(sockfd, (struct sockaddr *)&my_sockaddr, sizeof(my_sockaddr));
	if (connectfd < 0) {
		Perror("connect");
	}
    
	while(1) {
        send_connect_to_server(sockfd);
        sleep(10);
	}
    
	close(sockfd);		

	return 0;
}
