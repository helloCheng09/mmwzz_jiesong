(function (wall) {
    /**
     * Limit Public
     * Bind wall
     */
    wall.extend({
        // 当没有家长信息时显示添加
        shownavtoadd() {
            var tshtml = `
            <div class="nav-to-add" id="navtoadd">
                <i class="layui-icon-unlink  layui-icon"></i>
                <span class="nav-tt"> 您暂未添加接送家长 </span>
            </div>
        `
            $("#insertslot").append(tshtml)

            // 跳转到添加页面
            $("#navtoadd").click(function () {
                wall.showtabmain({
                    showindex: 1,
                    // ifremove: false,
                })
            })
        },
        // 修改接送家长名片
        editcard(itemEle, resolve) {
            $(itemEle).off().click(function () {
                $('.layui-form').hide()
                var $self = $(this)
                // 切换选项卡
                wall.showtabmain({
                    showindex: 1,
                })
                console.log('获取修改家长信息')
                var index = wall.load({
                    loadstyle: 4,
                    // bg: "transparent",
                })

                setTimeout(() => {
                    console.log("获取成功")
                    $('.layui-form').show()
                    wall.close(index)
                }, 1000);

                // 执行回调函数
                resolve()
            })
        },
        // 删除接送名片
        deletcard(itemEle, index) {
            $(itemEle).off().click(function () {
                var $self = $(this)
                let confirmIndex = layer.confirm('是否确定删除次家长？', {
                    title: '妈妈我在这',
                    icon: 3,
                    closeBtn: false,
                }, function () {
                    var index = wall.load({
                        loadstyle: 4,
                        // bg: "transparent",
                    })

                    setTimeout(() => {
                        $self.parents('li').remove()
                        wall.close(index)
                        var lessnum = $('.parent-card-item').length
                        sessionStorage.setItem('parentnum', lessnum)
                        lessnum === 0 && $('.info-ts').remove();
                        lessnum === 0 && wall.shownavtoadd();

                    }, 1000);

                    layer.close(confirmIndex)
                })

            })
        },
        // 相机和相册弹窗选择
        uploadimg(resolve) {
            layui.use('layer', function () {
                var layer = layui.layer;
                wall.wx_uploadimg(function (res) { // 上传图片回调执行
                    console.log(res)
                    var localId = res.localId
                    var serverId = res.serverId; // 返回图片的服务器端ID
                    // 展示图片
                    if (!localId) { // 如果图片undefined
                        localId = "http://www.mamawozaizhe.com/public/jiesong/img/preload.png"
                    }
                    $('#addimgbtn').hide() // 隐藏上传按钮
                    $('.show-bx-face') && $('.show-bx-face').remove(); // 移除已有的图片
                    // 插入新图片
                    $("#faceslot").append(` 
                        <div class="show-bx-face">
                           <img src=${localId}  class="card-left" id="mainfaceimg" data-src=${localId} />
                                <div class="reupload">
                                    <div class="re-text">
                                        重新上传
                                    </div>
                                </div>      
                            </div>
                           
                            `)

                    $("input[name='pic']").val(serverId) // 赋值input
                    $('.reupload').off().click(function () { // 重新上传图片
                        wall.uploadimg()
                    })

                    // 预览图片
                    $("#mainfaceimg").click(function () {
                        var urls = [
                            $(this).data('src'),
                        ]
                        wx.previewImage({
                            current: urls[0], // 当前显示图片的http链接
                            urls: urls // 需要预览的图片http链接列表
                        });
                    })
                })

                // var index = layer.open({
                //     type: 1,
                //     content: `
                //         <div class="show-upload-select">
                //             <div>
                //                 <img id="selcamera" src="http://www.mamawozaizhe.com/public/jiesong/img/xiangji.png" class="select-upload-img">
                //                 <div class="label-tt">
                //                     相机拍摄
                //                 </div>
                //             </div>

                //             <div>
                //                 <img id="selalbum" src="http://www.mamawozaizhe.com/public/jiesong/img/xiangce.png" class="select-upload-img">
                //                 <div class="label-tt">
                //                     相册选择
                //                 </div>
                //             </div>
                //         </div>
                //     `, //这里content是一个普通的String
                //     title: false,
                //     closeBtn: false,
                //     shadeClose: true,
                // });
                // 弹出回调
                // resolve(index)
            });
            // 弹出回调
            typeof resolve === 'function' && resolve();
        },
        // 移除layui-form-danger样式
        removedanger() {
            $('.layui-input').focus(function () {
                $(this).removeClass('layui-form-danger')
            })
        },
        // 切换tab面板
        /**
         * @param {展示第几个面板} showindex 
         * @param {是否移除面板内容} ifremove
         */
        showtabmain(option) {
            // 展示第几个面板 index
            var showindex = option.showindex
            // 是否清空面板的内容
            var ifremove = ''
            option.ifremove ? ifremove = option.ifremove : ifremove = false
            $('.head-bx .layui-this').removeClass('layui-this')
            $('.head-tag').eq(showindex).addClass('layui-this')
            $('.layui-tab-content .layui-show').removeClass('layui-show')
            if (ifremove) {
                $('.js-show-tab').eq(showindex).empty()
            }
            $('.js-show-tab').eq(showindex).addClass('layui-show')
        }
    })
    // 请求地址
    // https://www.easy-mock.com/mock/5cce2e138ae25d6ff1c9cca5/jiesonglist/jslist
    wall.baseurl = 'https://www.easy-mock.com/mock/5cce2e138ae25d6ff1c9cca5/jiesonglist'
    wall.$api = {
        parentslist: '/jslist',
    }
    // 入口
    if (document.getElementById('addparentswrap')) {
        // 家长接送信息列表
        listindex()
    }

    /**
     * Functions
     * #1 addparentswrap
     */

    // addparentswrap
    function listindex() {
        // 获取家长信息列表
        $.ajax({
            url: wall.baseurl + wall.$api.parentslist,
            type: 'GET',
            success: function (res) {
                console.log(res)
                if (res.code == 1) {
                    // 获取成功
                    var html = ''
                    // 本地缓存家长添加数量，最多四个
                    sessionStorage.setItem('parentnum', res.data.length)
                    // console.log(sessionStorage.getItem('parentnum'))
                    var imglist = []
                    res.data.forEach((item, index) => {
                        imglist.push({
                            eleclass: `.preimg${index}`,
                            img: item.js_pic,
                        })
                        html += `
                        <li class="parent-card-item" id="${item.js_id}">
                            <div class="card-bx">
                                <img data-img="${item.js_pic}" src="http://www.mamawozaizhe.com/public/jiesong/img/preload.png" alt="妈妈" class="card-left preimg${index}">
                                <div class="right">
                                    <div class="item-det">
                                        <label for="relation">别名：</label>
                                        <span class="rel-dt">${item.js_name}</span>
                                    </div>
                                    <div class="item-de">
                                        <label for="creat-time">创建时间：</label>
                                        <span class="rel-dt time-dt">${item.create_time}</span>
                                    </div>
                                </div>
                                <span class="car-tag-num">
                                    <span>${index + 1}</span>
                                </span>
                            </div>
                            <div class="delet-card">
                                <button class="layui-btn layui-btn-danger  edit-card-btn">修改</button>
                                <button class="layui-btn layui-btn-danger  det-card-btn">删除</button>
                            </div>
                        </li> 
                        `
                    });
                    $('#insertslot').append(html).after(`<span class="ts-tt info-ts">* 点击接送家长信息修改或删除</span>`)

                    // console.log(`preimg${index}`);
                    imglist.forEach(item => {
                        wall.preloadimg({ // 图片预加载
                            imgele: item.eleclass,
                            img: item.img,
                        })
                    })

                    // 展示删除按钮
                    $('.parent-card-item').off().click(function () {
                        var $self = $(this)

                        $('.parent-card-item').find('.delet-card').slideUp('fast')
                        if ($self.find('.delet-card').css('display') != "block") {
                            $self.find('.delet-card').slideToggle('fast')
                        }
                        // 删除接送名片 
                        wall.deletcard('.det-card-btn')
                        // 修改名片
                        wall.editcard('.edit-card-btn', function () {})
                        return false
                    })
                    // 如果家长信息为0 的时候，提示添加家长信息
                    if (res.data.length == 0) {
                        wall.shownavtoadd()
                    }
                } else {
                    wall.alert(res.msg, {
                        delay: 1500
                    })
                }
            },
            error: function (err) {
                wall.alert(res.err.msg, {
                    delay: 1500
                })
            }
        })
        // 满4个家长，不让再添加
        if (Number(sessionStorage.getItem('parentnum')) == 4) {
            var tshtml = `
                <div class="nav-to-add">
                    <i class="layui-icon-unlink  layui-icon"></i>
                    <span class="nav-tt"> 您的接送家长已经达到上限 </span>
                </div>
            `
            $("#formslot").append(tshtml)
        } else {
            $('.layui-form').show()
        }
        // 上传人脸识别图片
        $('#addimgbtn').click(function () {
            wall.uploadimg(function (index) {})
        })

        // 提交接送家长表单
        layui.use('form', function () {
            var form = layui.form;
            wall.removedanger() // 移除danger提示
            form.verify({
                name(val) {
                    if (!val) {
                        return '请填写家长别名'
                    }
                },
                pic(val) {
                    if (!val) {
                        return '请上传人脸识别照片'
                    }
                }
            })
            form.on('submit(subparent)', function (data) {
                console.log(data.field) //被执行事件的元素DOM对象，一般为button对象
                // 提交
                wall.alert('提交后台', {
                    delay: 1500
                })
                return false
            });


        });


    }


})(window.wall || (window.wall = {}))