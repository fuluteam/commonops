package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/chujieyang/commonops/ops/conf"
	"github.com/chujieyang/commonops/ops/controllers/cloud"
	"github.com/chujieyang/commonops/ops/controllers/daily_job"
	"github.com/chujieyang/commonops/ops/controllers/data"
	"github.com/chujieyang/commonops/ops/controllers/dms"
	"github.com/chujieyang/commonops/ops/controllers/dns"
	"github.com/chujieyang/commonops/ops/controllers/k8s"
	"github.com/chujieyang/commonops/ops/controllers/monitor"
	"github.com/chujieyang/commonops/ops/controllers/user"
	"github.com/chujieyang/commonops/ops/models"
	"github.com/chujieyang/commonops/ops/untils"
	"github.com/chujieyang/commonops/ops/untils/k8s_utils"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func AuthMiddleWare() gin.HandlerFunc {
	return func(c *gin.Context) {
		var authToken = c.GetHeader("Authorization")
		if authToken == "" {
			authToken = c.Query("token")
		}
		parseToken, err := jwt.Parse(authToken, func(*jwt.Token) (interface{}, error) {
			return []byte(conf.SecretSalt), nil
		})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, untils.RespData{Code: 0, Msg: "token失效，请重新登录", Data: nil})
			untils.Log.Warn("Token is not valid")
		}
		if parseToken != nil {
			var parmMap = parseToken.Claims.(jwt.MapClaims)
			var expire = (int64)(parmMap["exp"].(float64))
			var now = time.Now().Unix()
			if expire < now {
				c.AbortWithStatusJSON(http.StatusUnauthorized, untils.RespData{Code: 0, Msg: "token失效，请重新登录", Data: nil})
				untils.Log.Warn("Token 过期")
			}
			var userInfo = parmMap["userInfo"].(map[string]interface{})
			userValid := models.IsUserValid(uint(userInfo["userId"].(float64)))
			if !userValid {
				c.AbortWithStatusJSON(http.StatusForbidden, untils.RespData{Code: 0, Msg: "用户不存在或被禁用，请联系管理员", Data: nil})
				untils.Log.Warn("user status is not valid")
			}
			if strings.Contains(c.Request.RequestURI, "kubernetes") {
				var k8sClusterId = c.GetHeader("ClusterId")
				k8sClient, err := k8s_utils.InitK8sClient(k8sClusterId)
				if err != nil {
					fmt.Println(err.Error())
				} else {
					c.Set("k8sCluster", &k8sClient)
				}
			}
			for k, v := range userInfo {
				c.Set(k, v)
			}
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, untils.RespData{Code: 0, Msg: "token失效，请重新登录", Data: nil})
			untils.Log.Warn("Token is not valid")
		}
		c.Next()
	}
}

func RegisterRouter(engine *gin.Engine) {
	engine.POST("/user/login", user.ILogin)

	wsRoute := engine.Group("/ws")
	{
		wsRoute.GET("/kubernetes/container_terminal", k8s.GetContainerTerminal)
		wsRoute.GET("/cloud/ssh", cloud.WsSsh)
	}

	userRoute := engine.Group("/user", AuthMiddleWare())
	{
		userRoute.GET("/tokenRefresh", user.ITokenRefresh)
		userRoute.POST("/updatePassword", user.IUpdatePassword)
		userRoute.POST("/create", user.IPostUserCreate)
		userRoute.PUT("/active", user.IPutUserActive)
		userRoute.GET("/list", user.IGetUsersList)
		userRoute.GET("/permissions", user.IGetUserPermissions)
		userRoute.POST("/feedback", user.IPostUserFeedback)
		userRoute.GET("/feedback", user.IGetUserFeedback)
	}

	cloudRoute := engine.Group("/cloud", AuthMiddleWare())
	{
		cloudRoute.GET("/accounts", cloud.IGetCloudAccounts)
		cloudRoute.POST("/accounts", cloud.IPostCloudAccounts)
		cloudRoute.PUT("/accounts", cloud.IPutCloudAccounts)
		cloudRoute.DELETE("/accounts", cloud.IDeleteCloudAccounts)

		cloudRoute.GET("/servers", cloud.IGetCloudServers)
		cloudRoute.POST("/servers", cloud.IPostCloudServers)
		cloudRoute.PUT("/servers", cloud.IPutCloudServers)
		cloudRoute.DELETE("/servers", cloud.IDeleteCloudServers)
		cloudRoute.GET("/servers/:id", cloud.IGetCloudServerDetail)
		cloudRoute.GET("/rds/:id", cloud.IGetCloudRdsDetail)
		cloudRoute.GET("/kv/:id", cloud.IGetCloudKvDetail)
		cloudRoute.GET("/slb/:id", cloud.IGetCloudSlbDetail)
		cloudRoute.GET("/rds", cloud.IGetCloudRds)
		cloudRoute.PUT("/rds", cloud.IPutCloudRds)
		cloudRoute.POST("/rds", cloud.IPostCloudRds)
		cloudRoute.DELETE("/rds", cloud.IDeleteCloudRds)
		cloudRoute.GET("/kv", cloud.IGetCloudKv)
		cloudRoute.PUT("/kv", cloud.IPutCloudKv)
		cloudRoute.POST("/kv", cloud.IPostCloudKv)
		cloudRoute.DELETE("/kv", cloud.IDeleteCloudKv)
		cloudRoute.GET("/slb", cloud.IGetCloudSlb)
		cloudRoute.DELETE("/slb", cloud.IDeleteCloudSlb)
		cloudRoute.GET("/other", cloud.IGetCloudOtherRes)
		cloudRoute.POST("/other", cloud.IPostCloudOtherRes)
		cloudRoute.DELETE("/other", cloud.IDeleteCloudOtherRes)
	}

	cloudMonitor := engine.Group("/cloud/monitor", AuthMiddleWare())
	{
		cloudMonitor.GET("/ecs", monitor.IGetCloudEcsMonitor)
		cloudMonitor.GET("/rds", monitor.IGetCloudRdsMonitor)
		cloudMonitor.GET("/kv", monitor.IGetCloudKvMonitor)
		cloudMonitor.GET("/slb", monitor.IGetCloudSlbMonitor)
	}

	roleRoute := engine.Group("/roles", AuthMiddleWare())
	{
		roleRoute.GET("/list", user.IGetRolesList)
		roleRoute.POST("/addRole", user.ICreateRole)
		roleRoute.PUT("/updateRole", user.IUpdateRole)
		roleRoute.DELETE("/deleteRole", user.IDeleteRole)
		roleRoute.GET("/users", user.IGetRoleUserList)
		roleRoute.POST("/users", user.IPostRoleUserList)
		roleRoute.GET("/resources", user.IGetRoleResourceList)
		roleRoute.POST("/resources", user.IPostRoleResourcesList)
		roleRoute.GET("/authLink", user.IGetRoleAuthLinkList)
		roleRoute.POST("/authLink", user.ICreateAuthLink)
		roleRoute.POST("/authLinks", user.ICreateRoleAuthLink)
		roleRoute.DELETE("/authLink", user.IDeleteAuthLink)
	}

	permissionRoute := engine.Group("/permissions", AuthMiddleWare())
	{
		permissionRoute.GET("/list", user.IGetPermissionsList)
	}

	jobRoute := engine.Group("/daily_job", AuthMiddleWare())
	{
		jobRoute.POST("/", daily_job.IPostDailyJob)
		jobRoute.GET("/", daily_job.IGetDailyJobs)
		jobRoute.GET("/info/:id", daily_job.IGetDailyJobDetail)
		jobRoute.PUT("/", daily_job.IPutDailyJob)
		jobRoute.PUT("/executorUser", daily_job.IPutDailyJobExecutorUser)
	}

	dataRoute := engine.Group("/data", AuthMiddleWare())
	{
		dataRoute.GET("/syncAliyunEcs", data.IGetAliyunEcsSync)
		dataRoute.GET("/syncAliyunRds", data.IGetAliyunRdsSync)
		dataRoute.GET("/syncAliyunKv", data.IGetAliyunKvSync)
		dataRoute.GET("/syncAliyunSlb", data.IGetAliyunSlbSync)
		dataRoute.GET("/syncAliyunStatisData", data.IGetAliyunStatisData)
	}

	k8sRoute := engine.Group("/kubernetes", AuthMiddleWare())
	{
		k8sRoute.GET("/cluster", k8s.GetK8sCluster)
		k8sRoute.POST("/cluster", k8s.PostK8sCluster)
		k8sRoute.DELETE("/cluster", k8s.DeleteK8sCluster)
		k8sRoute.GET("/namespaces", k8s.GetNamespaces)
		k8sRoute.POST("/namespaces", k8s.PostNamespaces)
		k8sRoute.DELETE("/namespaces", k8s.DeleteNamespaces)
		k8sRoute.GET("/deployments", k8s.GetDeployments)
		k8sRoute.GET("/replication_controllers", k8s.GetReplicationControllers)
		k8sRoute.GET("/replica_sets", k8s.GetReplicaSets)
		k8sRoute.GET("/pods", k8s.GetPods)
		k8sRoute.GET("/pod/log", k8s.GetPodLogs)
		k8sRoute.GET("/nodes", k8s.GetNodes)
		k8sRoute.GET("/services", k8s.GetServices)
		k8sRoute.GET("/ingress", k8s.GetIngress)
		k8sRoute.GET("/config_dict", k8s.GetConfigDict)
		k8sRoute.GET("/secret_dict", k8s.GetSecretDict)
		k8sRoute.POST("/yaml_resource", k8s.CreateResourceByYaml)
		k8sRoute.GET("/yaml", k8s.GetResourceYaml)
		k8sRoute.PUT("/scale", k8s.PutResourceScale)
		k8sRoute.DELETE("/resource", k8s.DeleteResource)
		k8sRoute.DELETE("/config_map", k8s.DeleteConfigMap)
		k8sRoute.DELETE("/secret", k8s.DeleteSecret)
		k8sRoute.GET("/metrics/node", k8s.GetNodesMetrics)
		k8sRoute.GET("/metrics/pod", k8s.GetPodMetrics)
	}

	dmsRoute := engine.Group("/dms", AuthMiddleWare())
	{
		dmsRoute.GET("/instances", dms.IGetDmsInstanceData)
		dmsRoute.POST("/instance", dms.IPostDmsInstance)
		dmsRoute.DELETE("/instance", dms.IDeleteDmsInstance)
		dmsRoute.GET("/instances/all", dms.IGetAllDmsInstancesData)
		dmsRoute.GET("/authData", dms.IGetDmsAuthData)
		dmsRoute.GET("/instanceData", dms.IGetDmsInstanceData)
		dmsRoute.GET("/databaseData", dms.IGetDmsDatabaseByInstanceId)
		dmsRoute.DELETE("/databaseData", dms.IDeleteDmsDatabaseByDatabaseId)
		dmsRoute.POST("/databaseData", dms.IPostDmsDatabase)
		dmsRoute.POST("/auth", dms.IPostDmsUserAuth)
		dmsRoute.DELETE("/userAuth", dms.IDeleteDmsUserAuth)
		dmsRoute.GET("/userInstanceData", dms.IGetUserDmsInstanceData)
		dmsRoute.GET("/userDatabaseData", dms.IGetUserDmsDatabaseData)
		dmsRoute.POST("/userExecSQL", dms.IPostDmsUserExecSQL)
		dmsRoute.GET("/userLog", dms.IGetDmsQueryLogData)
	}

	dnsRoute := engine.Group("/dns", AuthMiddleWare())
	{
		dnsRoute.POST("/domain", dns.IPostDnsDomain)
		dnsRoute.GET("/domainList", dns.IGetDnsDomainList)
		dnsRoute.GET("/domainHistoryList", dns.IGetDnsDomainHistoryList)
		dnsRoute.GET("/domainRecordsList", dns.IGetDnsDomainRecordsList)
		dnsRoute.POST("/domainRecord", dns.IPostDnsDomainRecord)
		dnsRoute.POST("/domainRecordUpdate", dns.IUpdateDnsDomainRecord)
		dnsRoute.DELETE("/domainRecord", dns.IDeleteDnsDomainRecord)
		dnsRoute.POST("/domainRecordStatus", dns.IPostDnsDomainRecordStatus)
	}

}
