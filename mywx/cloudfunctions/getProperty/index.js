// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  //return event.diary_id
  const wxContext = cloud.getWXContext()
  return await db.collection("Properties").where({
    id_diary: event.diary_id,
    id_user: event.user_id,
  }).get({
    success(res){
      console.log("请求成功", res)
    },
    fail(err){
      console.log("请求失败", err)
    },
  })

}