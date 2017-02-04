/**
 * 与服务器数据交互. <br/>
 * 
 */
;
define(["../libs/zepto.dev"], function(window, $) {

    "use strict";
    
    var API = function(options) {

        var defaults = {

            // 基础参数;
            baseData: {
                hostUrl: "mock_url", //由PHP模拟数据
                book_id: "",
                user_id: "",
            },

            // 根据业务逻辑, "过境"数据 {Object};
            passData: null
        };

        this.opts = $.extend(true, {}, defaults, options);

    };

    /**
     * 获取知识型知识结构数据. </br>
     * 
     * @param {Object} data null
     * @param {Object} successCb
     * @param {Object} errorCb
     */
    API.prototype.getKnowledgeTree = function(data, successCb, errorCb) {
        var optsObj = this.opts;

        var defaultData = {
            'action': "get_knowledge_tree",
            'book_id': optsObj.baseData.book_id,
            'user_id': optsObj.baseData.user_id,
        };

        var requestData = $.extend(true, {}, defaultData, optsObj.passData, data);

        $.ajax({
            type: "get",
            url: optsObj.baseData.hostUrl,
            async: true,
            data: requestData,
            timeout: 3000,
            dataType: 'json',
            success: function(result, status, xhr) {
                if(result.status && (typeof successCb == "function")) {
                    successCb(result.data);
                } else {
                    if(typeof errorCb == "function") {
                        errorCb(result.error);
                    }
                }
            },
            error: function(xhr, status, error) {
                if(typeof errorCb == "function") {
                    errorCb(error);
                }
            }
        });
    };

    return API;

});