"use strict"
    var dappAddress = "n1ruE8QEwX6Rvc5LBtAwLFrK4YTQWZgATnM";
    var nebulas = require("nebulas"),
        Account = nebulas.Account,
        neb = new nebulas.Neb();
    neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

    // 搜索功能: 查找Super-Dictionary 中有没有该词条
    $("#search_book").click(function(){
        // $("#search_value").val() 搜索框内的值
        var from = Account.NewAccount().getAddressString();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "get";
        var callArgs = "[\"" + $("#book_name_search").val() + "\"]"; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
            cbSearch(resp)
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })

    })

     //return of search,
    function cbSearch(resp) {
        var result = resp.result    ////resp is an object, resp.result is a JSON string
        console.log("return of rpc call: " + JSON.stringify(result))

        if (result === 'null' || result == ''){
        	$("#error_message").addClass("hide");
            $(".result_faile").removeClass("hide");
            $(".result_success").addClass("hide");

            $("#book_name").val("");
            $("#book_author").val("");
            $("#book_rate").val("");
            $("#book_download").val(""); $("#book_download").val("")
            $("#book_description").val("");
        } else{
            //if result is not null, then it should be "return value" or "error message"
            try{
                result = JSON.parse(result)
            }catch (err){
                //result is the error message
            }
            
            if (result.key !== undefined && result.writer !== undefined){      //"return value"
                $(".result_faile").addClass("hide");  
            	
				$(".book_info_p").removeClass("hide");

                $("#book_name_p").text("Book Name: " + result.key)
                $("#book_author_p").text("Author: " + result.writer)
                $("#book_rate_p").text("Rate: " + result.rate)
                $("#book_download_p").val("Download Address: " + result.linkAddress)
                $("#book_description_p").text(result.description);
                $("#book_contributor_p").text("Contributed By: " + result.author)

                $(".result_success").removeClass("hide");
                $("#error_message").addClass("hide");
            }else {        //"error message"
                $(".result_faile").addClass("hide");
                $(".result_success").addClass("hide");
            	$("#error_message").removeClass("hide");
                $("#error_message").text("Error: The book name should not be empty");
                // $(".result_success").removeClass("hide");
                console.log(JSON.stringify(result) + result.key);
            }

        }
        $("#book_name_search").text("");

    }

    var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
    var nebPay = new NebPay();
    var serialNumber

    $("#push_book").click(function() {

        var to = dappAddress;
        var value = "0";
        var callFunction = "save"
        var book_name = $("#book_name").val()
        var book_author = $("#book_author").val()
        var book_rate = $("#book_rate").val()
        var book_linkAddress = $("#book_download").val("")
        var book_description = $("#book_description").val()
        var callArgs = "[\"" + book_name + "\",\"" + book_author + "\",\"" + book_rate + "\",\""  + book_linkAddress + "\",\"" + book_description + "\"]"

        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: cbPush        //设置listener, 处理交易返回信息
        });

        intervalQuery = setInterval(function () {
            funcIntervalQuery();
        }, 10000);
    });

    var intervalQuery

    function funcIntervalQuery() {
        nebPay.queryPayInfo(serialNumber)   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                console.log("tx result: " + resp)   //resp is a JSON string
                var respObject = JSON.parse(resp)
                if(respObject.code === 0){
                    // alert(`set ${$("#book_name_p").val()} succeed!`)
                    $("#exampleModal").modal('toggle');
                    clearInterval(intervalQuery);
                    $(".result_faile").addClass("hide");  

					
                	$("#book_name_p").text("Book Name: " + book_name)
                	$("#book_author_p").text("Author: " + book_author)
                	$("#book_rate_p").text("Rate: " + book_rate)
                    $("#book_download_p").val("Download Address: " + book_linkAddress)
                	$("#book_description_p").text(book_description);
                	$("#book_contributor_p").addClass("hide");
                	$("#book_name_search").val("");

                	$(".result_success").removeClass("hide");
                	$("#error_message").addClass("hide");
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    function cbPush(resp) {
        console.log("response of push: " + JSON.stringify(resp))
    }
