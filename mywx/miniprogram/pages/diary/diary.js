// miniprogram/pages/diary/diary.js
const app = getApp()
const db = wx.cloud.database();//初始化数据库

Page({
  data: {
    img_url: '',
    length: 0,
    nowPgae: 1,
    startX: 0,
    slider: false,
    animationData: {},
    showDelete: false,
    user_id: '',
    diaryid: '1590399306189-649',
    cardInfoList: []
  },

  onLoad: function (options) {
    var cardList = []
    var my_list = [{ title: '-1', id: '-1', cover: '../../images/back.jpg', },]
    let that = this
    db.collection("Users").where({
      openid: getApp().globalData.openid,
    }).get({
      success(res) {
        console.log("请求成功", res)
        that.setData({
          user_id: res.data[0].user_id
        })
        console.log(that.data.user_id)
        wx.cloud.callFunction({
          name: "getDiarylist",
          data: {
            user_id: that.data.user_id,
          },
          success(res) {
            console.log("请求云函数成功", res)
            cardList = res.result.data
            that.setData({
              length: res.result.data.length,
              cardInfoList: my_list
            })
            var i = 0
            
            let a = async function (i, original_data, that) {

              return await wx.cloud.callFunction({
                name: "getDiary",
                data: {
                  user_id: that.data.user_id,
                  diary_id: cardList[i].diary_id
                },
                success(res) {
                  console.log("请求云函数成功", res)
                  if (!res.result.data[0].is_time) {
                    var dict = {}
                    dict['diary_id'] = original_data.diary_id
                    dict['content'] = original_data.content
                    dict['id_user'] = original_data.id_user
                    dict['diary_date'] = res.result.data[0].date_write
                    dict['mood'] = res.result.data[0].emotion
                    dict['authority'] = res.result.data[0].permission
                    dict['times'] = res.result.data[0].is_time
                    dict['year'] = res.result.data[0].year
                    dict['title'] = res.result.data[0].title
                    dict['weather'] = res.result.data[0].weather
                    if (!res.result.data[0].img_url) {
                      dict['img_url'] = 'cloud://seey-zhou-wr3tn.7365-seey-zhou-wr3tn-1302195802/1590115601743.png'
                    }
                    else {
                      dict['img_url'] = res.result.data[0].img_url
                    }
                    my_list.push(dict)
                  }

                },
                fail(err) {
                  console.log("请求云函数失败", err)
                }
              })

            }
            for (i = 0; i < that.data.length; i++) {
              a(i, cardList[i], that)
            }
            that.setData({
              cardInfoList: my_list
            })
            console.log(that.data.cardInfoList)
          },
          fail(err) {
            console.log("请求云函数失败", err)
          }
        })

      },
      fail(err) {
        console.log("请求云函数失败", err)
      }
    })
  },
  touchstart(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
    })

  },
  touchend(e) {
    let that = this;
    let startX = this.data.startX;
    let startY = this.data.startY;
    let endX = e.changedTouches[0].clientX;
    if (this.data.slider) return;

    // 下一页(左滑距离大于30)
    if (startX - endX > 30) {
      this.setData({
        slider: true
      });
      //尾页(当前页 等于 总页数)
      if (this.data.nowPgae == this.data.cardInfoList.length) {
        this.setData({
          slider: false
        });
        wx.showToast({ title: '已经是最后一张了', icon: 'none' });
        return;
      };

      //创建动画   5s将位置移动到-150%,-150%
      let animation = wx.createAnimation({
        duration: 500,
      });
      animation.translateX('-150%').translateY('-150%').rotate(60).step();
      this.setData({
        animationData: animation.export()
      });

      // 移动完成后
      setTimeout(function () {
        var cardInfoList = that.data.cardInfoList;
        var slidethis = that.data.cardInfoList.shift(); //删除数组第一项
        that.data.cardInfoList.push(slidethis); //将第一项放到末尾
        //创建动画   将位置归位
        let animation = wx.createAnimation({
          duration: 0,
        });
        animation.translateX('-53%').translateY('-50%').rotate(0).step();

        that.setData({
          cardInfoList: that.data.cardInfoList,
          animationData: animation.export(),
          slider: false,
          nowPgae: that.data.nowPgae + 1
        });
      }, 500)
    }
    // 上一页
    if (endX - startX > 30) {
      this.setData({
        slider: true
      })
      //首页
      if (this.data.nowPgae == 1) {
        this.setData({
          slider: false
        })
        wx.showToast({ title: '已经到第一张了', icon: 'none' })
        return;
      };
      //创建动画  移动到-150%,-150%
      let animation = wx.createAnimation({
        duration: 0,
      });
      animation.translateX('-150%').translateY('-150%').rotate(100).step();
      var cardInfoList = that.data.cardInfoList;
      var slidethis = that.data.cardInfoList.pop(); //删除数组末尾项
      that.data.cardInfoList.unshift(slidethis);//将删除的末尾项放到第一项
      that.setData({
        animationData: animation.export(),
        cardInfoList: that.data.cardInfoList,
      });
      setTimeout(function () {
        //创建动画   5s将位置移动到原位
        let animation2 = wx.createAnimation({
          duration: 500,
          // timingFunction: 'cubic-bezier(.8,.1,.2,0.8)',
        });
        animation2.translateX('-53%').translateY('-50%').rotate(0).step();
        that.setData({
          animationData: animation2.export()
        });
        that.setData({
          slider: false,
          nowPgae: that.data.nowPgae - 1
        });
      }, 50)
    }
  },

  /***跳转写日记 */
  towriteDiary() {
    wx.navigateTo({
      url: '../writeDiary/writeDiary',
    })
  },
  toeditDiary(e) {
var index = e.currentTarget.dataset.index
    console.log(index)
    app.globalData.content = this.data.cardInfoList[index].content  // 获取goodsList[index].num
    app.globalData.diary_date = this.data.cardInfoList[index].diary_date  // 获取goodsList[index].num
    app.globalData.mood = this.data.cardInfoList[index].mood  // 获取goodsList[index].num
    app.globalData.authority = this.data.cardInfoList[index].authority  // 获取goodsList[index].num
    app.globalData.times = this.data.cardInfoList[index].times  // 获取goodsList[index].num
    app.globalData.year = this.data.cardInfoList[index].year  // 获取goodsList[index].num
    app.globalData.imgbox = this.data.cardInfoList[index].img_url  // 获取goodsList[index].num
    app.globalData.background = this.data.cardInfoList[index].background  // 获取goodsList[index].num
    app.globalData.title = this.data.cardInfoList[index].title  // 获取goodsList[index].num
    app.globalData.weather = this.data.cardInfoList[index].weather  // 获取goodsList[index].num
    app.globalData.diaryid = this.data.cardInfoList[index].diary_id  // 获取goodsList[index].num               
    wx.navigateTo({
      url: '../editDiary/editDiary',
    })
  },

  /***删除日记 */
  deleteDiary: function (e) {
    let that = this
    let id = e.currentTarget.dataset.index
    that.setData({
      showDelete: true,
      temp_id: id
    })
    console.log(id)
    console.log(that.data.cardInfoList)
    console.log(that.data.cardInfoList[id])
    db.collection("Users").where({
      openid: getApp().globalData.openid,
    }).get({
      success(res) {
        console.log("请求成功", res)
        that.setData({
          user_id: res.data[0].user_id
        })

        wx.cloud.callFunction({
          name: "deleteDiary",
          data: {
            user_id: that.data.user_id,
            diary_id:  that.data.cardInfoList[id].diary_id
          },
          success(res) {
            console.log("请求云函数成功", res)
          },
          fail(err) {
            console.log("请求云函数失败", err)
          }
        })
        wx.cloud.callFunction({
          name: "deleteProperty",
          data: {
            user_id: that.data.user_id,
            diary_id:  that.data.cardInfoList[id].diary_id
          },
          success(res) {
            console.log("请求云函数成功", res)
          },
          fail(err) {
            console.log("请求云函数失败", err)
          }
        })

      },
      fail(err) {
        console.log("请求失败", err)
      },
    })
  },
  /**点击返回按钮隐藏 */
  del_back: function () {
    this.setData({
      showDelete: false
    })
  },
  /** 点击确定按钮获取input值并且关闭弹窗 */
  del_ok: function () {
    var cardInfoList = this.data.cardInfoList;
    cardInfoList.splice(this.data.temp_id, 1);
    this.setData({
      showDelete: false,
      cardInfoList: cardInfoList,

    })
  },
})

