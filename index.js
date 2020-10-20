const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
var eventproxy = require('eventproxy')
var ep = new eventproxy()
var homeInfoList=[]
let urlList=[]
let count = 33

urlList.push('https://yibin.lianjia.com/zufang/#contentList')
for(let i = 2;i<=count;i++){
    let url = `https://yibin.lianjia.com/zufang/pg${i}/#contentList`
    urlList.push(url)
}
function main(){
     getInfoByUrl()
    // console.log(homeInfoList.length)
    ep.after('getInfo',count,function(info){
        let list = []
        info.map((item)=>{
            list.push(...item)
        })
        homeInfoList = list
        fs.writeFile('D:/租房文件.txt',JSON.stringify(list),function(err){
           if(err){
               return err
           }
           console.log("成功")
       })
    })
}
main()
 function getInfoByUrl(){
    for(let i=0;i<count;i++){
         superagent
         .get(urlList[i])
         .end(  (err,res)=>{
            if(err){
                console.log('抓取失败')
            }else{
            //   console.log(await getHomeInfo(res.text))
               let v =   getHomeInfo(res.text)
                ep.emit('getInfo',v);
            } 
        })
    }
      
}
  function getHomeInfo(pageHtml){
    let homeInfo = []
    let $ = cheerio.load(pageHtml, { decodeEntities: false })
    $('div.content__list--item--main').each((idx,ele)=>{
        // console.log($(ele).html())
        let info = {
            name:$(ele).find('p.content__list--item--title').text().trim(),
            des:$(ele).find('.content__list--item--des').children('a').eq(1).text(),
            price:$(ele).find('.content__list--item-price').children('em').text(),
            area:$(ele).html().match(/(\d+)㎡/)[1]
        }
        homeInfo.push(info)
    })
    return homeInfo
}
const app = express()
let server = app.listen(3000,function(){
    console.log('app is starting in port 3000')
   app.get('/',function(req,res){
       console.log(homeInfoList)
       res.send(homeInfoList)
   })
})