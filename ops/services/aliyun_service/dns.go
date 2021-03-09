package aliyun_service

import (
	"fmt"

	"github.com/aliyun/alibaba-cloud-sdk-go/sdk/requests"
	"github.com/aliyun/alibaba-cloud-sdk-go/services/alidns"
	"github.com/pkg/errors"
)

func GetCloudAccountDomainList(region string, accessKey string, keySecret string, domainName string, pageNumber string, pageSize string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateDescribeDomainsRequest()
		request.Scheme = "https"
		request.KeyWord = domainName
		request.PageNumber = requests.Integer(pageNumber)
		request.PageSize = requests.Integer(pageSize)
		response, err1 := client.DescribeDomains(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}

func GetCloudAccountDomainHistoryList(region string, accessKey string, keySecret string, domainName string, pageNumber string, pageSize string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateDescribeRecordLogsRequest()
		request.Scheme = "https"
		request.DomainName = domainName
		request.PageNumber = requests.Integer(pageNumber)
		request.PageSize = requests.Integer(pageSize)
		response, err1 := client.DescribeRecordLogs(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}

func GetCloudAccountDomainRecordsList(region string, accessKey string, keySecret string, domainName string, domainRecordRR string, pageNumber string, pageSize string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateDescribeDomainRecordsRequest()
		request.Scheme = "https"
		request.DomainName = domainName
		request.RRKeyWord = domainRecordRR
		request.PageNumber = requests.Integer(pageNumber)
		request.PageSize = requests.Integer(pageSize)
		response, err1 := client.DescribeDomainRecords(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}

func GetCloudAccountDomainCnameRecordsList(region string, accessKey string, keySecret string, domainName string, domainRecordRR string, pageNumber string, pageSize string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateDescribeDomainRecordsRequest()
		request.Scheme = "https"
		request.DomainName = domainName
		request.RRKeyWord = domainRecordRR
		request.TypeKeyWord = "CNAME"
		request.PageNumber = requests.Integer(pageNumber)
		request.PageSize = requests.Integer(pageSize)
		response, err1 := client.DescribeDomainRecords(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}

func AddCloudAccountDomain(region string, accessKey string, keySecret string, domainName string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateAddDomainRequest()
		request.Scheme = "https"
		request.DomainName = domainName
		response, err1 := client.AddDomain(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}

func AddCloudAccountDomainRecord(region string, accessKey string, keySecret string,
	domainName string, rr string, rrType string, value string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateAddDomainRecordRequest()
		request.Scheme = "https"
		request.DomainName = domainName
		request.RR = rr
		request.Type = rrType
		request.Value = value
		response, err1 := client.AddDomainRecord(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}

func UpdateCloudAccountDomainRecord(region string, accessKey string, keySecret string,
	recordId string, rr string, rrType string, value string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateUpdateDomainRecordRequest()
		request.Scheme = "https"
		request.RecordId = recordId
		request.RR = rr
		request.Type = rrType
		request.Value = value
		response, err1 := client.UpdateDomainRecord(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}

func DeleteCloudAccountDomainRecord(region string, accessKey string, keySecret string, recordId string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateDeleteDomainRecordRequest()
		request.Scheme = "https"
		request.RecordId = recordId
		response, err1 := client.DeleteDomainRecord(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}

func SetCloudAccountDomainRecordStatus(region string, accessKey string, keySecret string, recordId string, status string) (data string, err error) {
	if client, err1 := alidns.NewClientWithAccessKey(
		region, accessKey, keySecret); client == nil || err1 != nil {
		err = errors.New("alidns client init error")
		return
	} else {
		request := alidns.CreateSetDomainRecordStatusRequest()
		request.Scheme = "https"
		request.RecordId = recordId
		request.Status = status
		response, err1 := client.SetDomainRecordStatus(request)
		if err1 != nil {
			fmt.Print(err1.Error())
			err = err1
			return
		}
		if response != nil && response.IsSuccess() {
			data = response.GetHttpContentString()
		} else {
			err = errors.New(response.GetHttpContentString())
		}
	}
	return
}
