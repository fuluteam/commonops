package conf

import (
	"fmt"
	"os"

	"gopkg.in/ini.v1"
)

var Host string
var Port string
var SecretSalt string
var DesKey string
var DmsConcurrentOperationNum int

var MysqlHost string
var MysqlUser string
var MysqlPwd string
var MysqlDb string

func init() {
	fmt.Println("config.ini 配置初始化...")
	cfg, err := ini.Load("./conf/config.ini")
	if err != nil {
		fmt.Printf("Fail to read file: %v", err)
		os.Exit(1)
	}

	Host = cfg.Section("app").Key("Host").String()
	Port = cfg.Section("app").Key("Port").String()
	SecretSalt = cfg.Section("app").Key("SecretSalt").String()
	DmsConcurrentOperationNum = cfg.Section("app").Key("DmsConcurrentOperationNum").MustInt(2)

	MysqlHost = cfg.Section("database").Key("MysqlHost").String()
	MysqlUser = cfg.Section("database").Key("MysqlUser").String()
	MysqlPwd = cfg.Section("database").Key("MysqlPwd").String()
	MysqlDb = cfg.Section("database").Key("MysqlDb").String()
	fmt.Println(" ---- 用户配置 ---- ")
	fmt.Println(Host)
	fmt.Println(Port)
	fmt.Println(DmsConcurrentOperationNum)
	fmt.Println(MysqlHost)
	fmt.Println(MysqlUser)
	fmt.Println(MysqlDb)
	fmt.Println("config.ini 配置初始化完成")
}
