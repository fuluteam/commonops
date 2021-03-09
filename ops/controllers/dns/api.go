package dns

import (
	"fmt"
	"net/http"

	"github.com/chujieyang/commonops/ops/models"
	"github.com/chujieyang/commonops/ops/services/aliyun_service"
	"github.com/chujieyang/commonops/ops/untils"
	"github.com/gin-gonic/gin"
)

type DnsDomainReq struct {
	PageNum        int    `json:"pageNum" form:"pageNum"`
	PageSize       int    `json:"pageSize" form:"pageSize"`
	CloudAccountId int    `json:"cloudAccountId" form:"cloudAccountId"`
	DomainName     string `json:"domainName" form:"domainName"`
	RR             string `json:"rr" form:"rr"`       // 主机记录
	RType          string `json:"rType" form:"rType"` // 记录类型
	RValue         string `json:"rValue" form:"rValue"`
	RecordId       string `json:"recordId" form:"recordId"`
	Status         string `json:"status" form:"status"`
}

type DnsDomainCnameReq struct {
	RR     string `json:"rr" form:"rr" binding:"required"`
	RValue string `json:"rValue" form:"rValue" binding:"required"`
	Sign   string `json:"sign" form:"sign" binding:"required"`
}

type DnsDomainCnameQueryReq struct {
	PageNum  int    `json:"pageNum" form:"pageNum" binding:"required"`
	PageSize int    `json:"pageSize" form:"pageSize" binding:"required"`
	RR       string `json:"rr" form:"rr" binding:"required"`
	Sign     string `json:"sign" form:"sign" binding:"required"`
}

type AliDnsListResp struct {
	TotalCount int64 `json:"TotalCount"`
}

/*
 [api post]: 新增域名
*/
func IPostDnsDomain(c *gin.Context) {
	var req DnsDomainReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	cloudAccount, err := models.GetCloudAccountInfo(req.CloudAccountId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	data, err := aliyun_service.AddCloudAccountDomain(cloudAccount.Region, cloudAccount.Key, cloudAccount.Secret, req.DomainName)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	fmt.Println(fmt.Sprintf("添加域名：%#v", req))
	c.JSON(http.StatusOK, untils.RespData{Code: 0, Msg: "success", Data: data})
}

/*
 [api get]: 获取域名列表
*/
func IGetDnsDomainList(c *gin.Context) {
	var req DnsDomainReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	cloudAccount, err := models.GetCloudAccountInfo(req.CloudAccountId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	data, err := aliyun_service.GetCloudAccountDomainList(cloudAccount.Region, cloudAccount.Key, cloudAccount.Secret,
		req.DomainName, fmt.Sprintf("%d", req.PageNum), fmt.Sprintf("%d", req.PageSize))
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	c.JSON(http.StatusOK, untils.RespData{Code: 0, Msg: "success", Data: data})
}

/*
 [api get]: 获取域名解析历史列表
*/
func IGetDnsDomainHistoryList(c *gin.Context) {
	var req DnsDomainReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	cloudAccount, err := models.GetCloudAccountInfo(req.CloudAccountId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	data, err := aliyun_service.GetCloudAccountDomainHistoryList(cloudAccount.Region, cloudAccount.Key, cloudAccount.Secret, req.DomainName, "1", "10")
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	c.JSON(http.StatusOK, untils.RespData{Code: 0, Msg: "success", Data: data})
}

/*
 [api get]: 获取域名解析记录列表
*/
func IGetDnsDomainRecordsList(c *gin.Context) {
	var req DnsDomainReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	cloudAccount, err := models.GetCloudAccountInfo(req.CloudAccountId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	data, err := aliyun_service.GetCloudAccountDomainRecordsList(cloudAccount.Region, cloudAccount.Key, cloudAccount.Secret, req.DomainName, req.RR,
		fmt.Sprintf("%d", req.PageNum), fmt.Sprintf("%d", req.PageSize))
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	c.JSON(http.StatusOK, untils.RespData{Code: 0, Msg: "success", Data: data})
}

/*
 [api post]: 新增域名解析记录
*/
func IPostDnsDomainRecord(c *gin.Context) {
	var req DnsDomainReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	cloudAccount, err := models.GetCloudAccountInfo(req.CloudAccountId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	data, err := aliyun_service.AddCloudAccountDomainRecord(cloudAccount.Region, cloudAccount.Key, cloudAccount.Secret, req.DomainName,
		req.RR, req.RType, req.RValue)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	fmt.Println(fmt.Sprintf("添加记录：%#v", req))
	c.JSON(http.StatusOK, untils.RespData{Code: 0, Msg: "success", Data: data})
}

/*
 [api post]: 修改域名解析记录
*/
func IUpdateDnsDomainRecord(c *gin.Context) {
	var req DnsDomainReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	cloudAccount, err := models.GetCloudAccountInfo(req.CloudAccountId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	data, err := aliyun_service.UpdateCloudAccountDomainRecord(cloudAccount.Region, cloudAccount.Key, cloudAccount.Secret, req.RecordId,
		req.RR, req.RType, req.RValue)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	fmt.Println(fmt.Sprintf("修改记录：%#v", req))
	c.JSON(http.StatusOK, untils.RespData{Code: 0, Msg: "success", Data: data})
}

/*
 [api delete]: 删除域名解析记录
*/
func IDeleteDnsDomainRecord(c *gin.Context) {
	var req DnsDomainReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	cloudAccount, err := models.GetCloudAccountInfo(req.CloudAccountId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	data, err := aliyun_service.DeleteCloudAccountDomainRecord(cloudAccount.Region, cloudAccount.Key, cloudAccount.Secret, req.RecordId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	fmt.Println(fmt.Sprintf("删除记录：%#v", req))
	c.JSON(http.StatusOK, untils.RespData{Code: 0, Msg: "success", Data: data})
}

/*
 [api post]: 设置域名解析记录状态
*/
func IPostDnsDomainRecordStatus(c *gin.Context) {
	var req DnsDomainReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	cloudAccount, err := models.GetCloudAccountInfo(req.CloudAccountId)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	data, err := aliyun_service.SetCloudAccountDomainRecordStatus(cloudAccount.Region, cloudAccount.Key, cloudAccount.Secret, req.RecordId, req.Status)
	if err != nil {
		c.JSON(http.StatusOK, untils.RespData{Code: -1, Msg: string(err.Error()), Data: nil})
		return
	}
	fmt.Println(fmt.Sprintf("设置记录状态：%#v", req))
	c.JSON(http.StatusOK, untils.RespData{Code: 0, Msg: "success", Data: data})
}
