import plugin from '../../lib/plugins/plugin.js'
import cfg from '../../lib/config/config.js'
import common from '../../lib/common/common.js'
import moment from 'moment'
import fetch from 'node-fetch'
const path = process.cwd()
const fs = require('fs')
const sharp = require('sharp')
/**
 不许私自转载，有问题或BUG进群反馈.
 原作者：摆烂煌(2608259582)
 改版作者：南絮(807331475)
 群聊：原神猫猫茶馆(646294298)
 编写于：2024/12/26-16:34
 不要随意改动代码，坏了不关我事！
 **/

// 支持信息详见文件最下方
// 在这里设置事件概率,请保证概率加起来小于1，少于1的部分会触发反击
let reply_text = 0.45 // 文字回复概率
let reply_img = 0.32 // 图片回复概率
let reply_voice = 0 // 语音回复概率
let mutepick = 0.1 // 禁言概率
let example = 0.05 // 拍一拍表情概率
// 剩下的0.08概率就是反击
let ttsapichoose = 'api2' // api设置
let noiseScale = 0.6 // 情感控制
let noiseScaleW = 0.8 // 发音时长
let lengthScale = 1 // 语速
let sdp_ratio = 0.2 // SDP/DP混合比
let language = 'ZH'
let api1url = 'https://api.lolimi.cn/API/yyhc/y.php'
// let api2url = 'https://bv2.firefly.matce.cn/run/predict'
let speakerapi1 = '纳西妲' // 生成角色api1
let text = ''
let master = '主人'
let mutetime = 0 // 禁言时间设置，单位分钟，如果设置0则为自动递增，如需关闭禁言请修改触发概率为0

// 定义图片存放路径 默认是Yunzai-Bot/resources/chuochuo
const chuo_path = path + '/resources/chuochuo/'

// 图片需要从1开始用数字命名并且保存为jpg或者gif格式，存在Yunzai-Bot/resources/chuochuo目录下
let jpg_number = 661 //输入jpg图片数量
let gif_number = 2 //输入gif图片数量

// 回复文字列表
let word_list = [
  '被戳晕了……轻一点啦！',
  '救命啊，有变态>_<！！！',
  '哼~~~',
  '你戳谁呢！你戳谁呢！！！           o(´^｀)o',
  '唔，这触感有种被兰那罗拿胡萝卜指着的感觉≥﹏≤',
  '不要再戳了！我真的要被你气死了！！！',
  '怎么会有你这么无聊的人啊！！！(￢_￢)',
  '把嘴张开（抬起脚）',
  '啊……你戳疼我了Ծ‸Ծ',
  '你干嘛！',
  '你是不是喜欢我？',
  '朗达哟？',
  '变态萝莉控！',
  '要戳坏掉了>_<',
  '旅行者，你没睡醒吗？一天天就知道戳我',
  '别戳了！在戳就丢你去喂鱼',
  '你戳我干嘛,闲得蛋疼吗?',
  '手痒痒,老是喜欢戳人。',
  '你戳我,我咬你!',
  '戳来戳去,真是的... ',
  '戳我也没用,改变不了你单身的事实。',
  '戏精,你戳我有完没完?',
  '戳我干嘛,要不要脸啊你!',
  '戳人家干嘛,难道我长得很好戳?',
  '戳完了,满足你的戳癖了吧!',
  '戳我啊,等会儿我报复,就不止戳一戳那么简单!',
  '你戳我,是想逗我开心吗?那我很开心噢!',
  '没事找事,真是的',
  '拜托,旅行者你能不能消停会?',
  '行了行了,戳完了没?闹腾完了没?',
  '你再戳,我要生气了哦',
  '惹不起,躲得起,您别老戳人家了行不?',
  '戳我一下,告诉我你有完没完',
  '你干嘛~',
  '再戳我要生气了！',
  '我也是有脾气的！',
  '有种被兰纳罗拿胡萝卜指着的感觉',
  '别戳我了，去戳主人吧',
  '就算你喜欢我也不能老戳我呀~',
  '你戳谁呢！你戳谁呢！！！',
  '不要再戳了！我真的要被你气死了！！！',
  '怎么会有你这么无聊的人啊！！！',
  '旅行者副本零掉落，旅行者深渊打不过，旅行者抽卡全保底，旅行者小保底必歪',
  '你、你不要这么用力嘛！戳疼我了呜呜呜~~~',
  '别戳了别戳了......',
  '麻麻要被揉坏了',
  '请，请轻一点，我会痛的......',
  '哎呦，你别戳了',
  '请不要不可以戳我啦~',
  '别戳了可以嘛',
  '要戳坏掉了>_<，呜呜呜',
  '你老是欺负我，哭哭惹',
  '别戳了啊！再戳就要坏掉了呀',
  '不可以，不可以，不可以！戳疼了！',
  '戳一次保底一次，嘻嘻',
  '痛QAQ...',
  '不要戳戳…',
  '诅咒你买方便面没有叉子！',
  '救命啊，有变态>_<！！！',
  '哼~~~',
  '食不食油饼？',
  '不要再戳了！我真的要被你气洗了！！！',
  '怎么会有你这么无聊的人啊！！！(￢_￢)',
  '把嘴张开（抬起脚）',
  '你干嘛！',
  '你是不是喜欢我？',
  '变态萝莉控！',
  '要戳坏掉了>_<',
  '你没睡醒吗？一天天就知道戳我',
  '不可以戳戳>_<',
  '不要戳了，再戳就坏掉啦>_<',
  '连个可爱小萝莉都要戳的肥宅真恶心啊',
  '小朋友别戳了',
  '是不是要可爱的我，揍你一顿才开心，哼',
  '怎么会有你这么无聊的人啊˃◡˂',
  '讨厌死了，你好烦人啊，不陪你玩了',
  '不要再戳了！我真的要被你气洗了>_<',
  '你戳谁呢！你戳谁呢~哼',
  '不要再戳了！',
  '你只需看着别人精彩，老天对你另有安排',
  '你戳的我有点开心奖励你哦',
  '不准戳',
  '你行不行啊细狗',
  '你要是在戳我！！我~我就打你哼',
  '可以不要戳了吗你好烦啊变态~变态',
  '讨厌死了',
  '本来很开心的，你为什么戳我鸭~变态',
  '哼~我才不是傲娇呢，那是什么不知道鸭',
  '我，我才不会这样子！真正的我从来不是傲娇！傲，傲娇什么 的，都，都是别人杜摆~嗯，一点，一点也没有呢',
  '我……我……才不是傲娇呢',
  '只是刚好路过而已，才不是因为你戳我特地来看你的呢！你可不要异想天开',
  '我可不是因为喜欢才这样做的哦',
  '总之你是个大笨蛋啦',
  '笨蛋，人家可不是特地来帮你们的呢',
  '全世界，我最讨厌你啦',
  '这~这种问题，我当然知道，我！我可不是要说给你听的， 我只是觉得_话太可怜了~对，所以给我认认真真的记住',
  '啊~好舒服鸭，其实我也不是很想要这个~如果你硬要给我，我就勉为其难的收下了',
  '群主大人快来鸭~有人欺负我',
  '只要你需要我就会在哦',
  '你这个变态，大变态，超级变态！不要在碰我了！',
  '好像因为太舒服昏过去了呢',
  '你怎么这样啊，这样欺负人不对的',
  '你在想涩涩对吗，不可以哦',
  '别戳了，别戳了，我爪巴',
  '别戳了，戳疼了',
  '别戳了再戳就坏掉了555',
  '你戳你戳毛线呢',
  '气死我了，气死我了，不要戳了！',
  '你~你~你要干什么啊',
  '唔嗯~戳疼了',
  '难道又有什么地方不舒服吗',
  '我在哦！是有什么事情吗？',
  '嗯呐~',
  '唔噫~',
  '在呢抱抱',
  '喵呜~喵呜',
  '唉？怎么了吗',
  '你会一直记得我吗',
  '抱我的小猫腿舔我的jio',
  '你这样就非常不可爱！',
  '你这种坏人，是会被狼吃掉的',
  '这事不应该是这样的阿~',
  '你这个人傻fufu的。',
  '你戳我有什么用？我有反弹技能',
  '你这个笨蛋蛋傻瓜瓜臭狗狗不要戳了了',
  '像你这种坏银，我才不稀罕哦。',
  '哼~有些笑容背后是紧咬牙关的灵魂。',
  '醒醒吧，别做梦了',
  '是不是把我当老婆了',
  '请问～～你睡了吗？',
  '这不是欺负人吗',
  '我不但可爱而且可爱你啦',
  '我发脾气了你就听着,结束了我会怂给你看',
  '劝你别整天对我戳戳戳的有本事你来亲亲我',
  '欢迎你走上爱我这条不归路。',
  '像我这种人，你除了宠着我也没有其他办法对吧',
  '我可爱吗，一直戳我',
  '宝宝是不是又熬夜了，我看你还在线',
  '笨蛋！哼！',
  '把我自己送给你好了虽然我很可爱但是我养不起了',
  '我偏偏要无理取闹除非抱抱我',
  '无事献殷勤，非…非常喜欢你~',
  '戳戳戳~希望你能有点自知之明，认识到超级无敌可爱的我',
  '要我给你暖被窝吗~哎嘿~想屁吃 ',
  '你再戳我~我就透你',
  '哎呀呀~喜欢我就直说嘛~',
  '别戳我了戳疼了',
  '我发脾气了~气死我了',
  '那里....不可以... ',
  '啊...温柔一点...把我戳疼辣..',
  '要戳坏掉了！',
  '你欺负人，呜呜',
  '你轻一点哦~',
  '我怕疼...轻一点~ ',
  '再戳就坏了！！！ ',
  '请...请...不要戳那里...',
  '要轻一点戳哦~',
  '快带我去玩！（打滚）',
  '哇，你这个人！',
  '是哪个笨蛋在戳我？',
  '干点正事吧！',
  '可恶！',
  '达咩！',
  '呜哇！',
  '你个坏蛋~',
  '不要这样啦！(摇头）',
  '呜哇！（惊醒）',
  '（阿巴阿巴）',
  '（眨眼）',
  '气气！',
  '过分分！',
  '走开啦！',
  '吃我一拳！',
  '讨厌！',
  '坏坏！',
  '哒咩，别戳了！',
  '呜哇！主人救命！',
  '你欺负我！',
  '（后空翻）',
  '（前空翻）',
  'QAQ呜哇啊啊啊啊啊！',
  'QAQ..这个人欺负我…',
  '呜呜，要变笨啦！',
  'rua~',
  '是不是要揍你一顿才开心啊！！！',
  '讨厌死了！',
  '小朋友别戳了',
  '不要再戳了！我真的要被你气死了！！！',
  '我真的要气洗掉了',
  '你干嘛老戳我啊qwq',
  '你再戳我就要闹了！哇啊啊啊！',
  '你这个人真是有奇怪的癖好呢~',
  '你是准备对我负责了吗，喵~',
  '小猫喵喵叫，那你是小狗该怎么叫呢~',
  '你个笨蛋，戳坏了怎么办啊！！',
  '哭哭，真的戳的很疼啦QAQ',
  '今天想吃枣椰蜜糖！给我买嘛~',
  '究竟是怎么样才能养出你这种变态呢！讨厌死了！',
  '不要再戳了好不好嘛~',
  '喵喵诅咒你买肯德基不是星期四~',
  '救命啊，有变态>_<！！！',
  '啊♂~',
  '那里，不可以~',
  '你戳谁呢！你戳谁呢！！！           o(´^｀)o',
  '是不是要本喵喵揍你一顿才开心啊！！！',
  '不要再戳了！我真的要被你气死了！！！',
  '你无不无聊啊，整天龊龊龊',
  '哼！坏旅行者副本零掉落，坏旅行者深渊打不过，坏旅行者抽卡全保底，坏旅行者小保底必歪，坏旅行者找不到女朋友！喵喵的诅咒🐱',
  '再氪两单嘛~救救必女吧！',
  '大魔王，大魔王，来接受我的制裁吧！ξ( ✿＞◡❛)',
  '我生气了！咋瓦乐多!木大！木大木大！',
  '朗达哟',
  '要戳坏掉了>_<',
  '呜呜呜，你没睡醒吗？一天天就知道戳我',
  '就你小子乱戳我，找打！',
  '戳你妈啊', '你™再戳我喵喵就把你超了',
  '你死定了，傻波一',
  '你干嘛哈哈欸哟',
  '你™犯法了知不知道喵！喵！',
  '你干嘛！你是不是要我喵喵给你八十拳',
  '乐，就知道戳，油饼食不食',
  '再喜欢我也不能这样戳啦，真的会坏掉的笨蛋!']

let ciku_ = [
  '俺今天已经被戳了_num_次啦，休息一下好不好',
  '我今天已经被戳了_num_次啦，有完没完！',
  '今天已经被戳了_num_次啦，要戳坏掉了！',
  '我今天已经被戳了_num_次啦，别戳了!!!',
  '我今天已经被戳了_num_次啦，不准戳了！！！',
  '我今天已经被戳了_num_次啦，再戳就坏了！'
]

// 语音回复文字，不能包含英文，特殊字符和颜文字，生成时间根据文字长度变化，添加文字时请安装我的格式进行添加，不能随意添加出bug我一律不管
let voice = ['看我超级我旋风！',
  '被戳晕了……轻一点啦！',
  '救命啊，有变态>_<！！！',
  '哼~~~',
  '你戳谁呢！你戳谁呢！！！           o(´^｀)o',
  '是不是要本萝莉揍你一顿才开心啊！！！',
  '唔，这触感有种被兰那罗拿胡萝卜指着的感觉≥﹏≤',
  '不要再戳了！我真的要被你气死了！！！',
  '怎么会有你这么无聊的人啊！！！(￢_￢)',
  '哼，我可是会还手的哦——“所闻遍计！”',
  '把嘴张开（抬起脚）',
  '啊……你戳疼我了Ծ‸Ծ',
  '你干嘛！',
  '我生气了！砸挖撸多!木大！木大木大！',
  '你是不是喜欢我？',
  '朗达哟？',
  '变态萝莉控！',
  '要戳坏掉了>_<',
  '旅行者，你没睡醒吗？一天天就知道戳我',
  '别戳了！在戳就丢你去喂鱼',
  '你戳我干嘛,闲得蛋疼吗?',
  '你刚刚是不是戳我了，你是坏蛋！我要戳回去，哼！！！',
  '手痒痒,老是喜欢戳人。',
  '你戳我,我咬你!',
  '戳来戳去的,真是的... ',
  '戳我也没用,改变不了你单身的事实。',
  '戏精,你戳我有完没完?',
  '戳我干嘛,要不要脸啊你!',
  '戳人家干嘛,难道我长得很好戳?',
  '戳完了,满足你的戳癖了吧!',
  '戳我啊,等会儿我报复,就不止戳一戳那么简单!',
  '你戳我,是想逗我开心吗?那我很开心噢!',
  '没事找事,真是的',
  '拜托,旅行者你能不能消停会?',
  '行了行了,戳完了没?闹腾完了没?',
  '你再戳,我要生气了哦',
  '惹不起,躲得起,您别老戳人家了行不?',
  '戳我一下,告诉我你有完没完']


export class chuo extends plugin {
  constructor () {
    super({
      name: '戳一戳',
      dsc: '戳一戳机器人触发效果',
      event: 'notice.group.poke',
      priority: 100,
      rule: [
        {
          /** 命令正则匹配 */
          fnc: 'chuoyichuo'
        }
      ]
    }
    )
  }

  // 调用语音合成API
  async generateVoice (text, speakerapi1) {
    const baseUrl = api1url
    const params = new URLSearchParams({
      msg: text,
      speaker: speakerapi1,
      noisew: noiseScaleW,
      sdp: sdp_ratio,
      Length: noiseScaleW,
      noise: noiseScale,
      type: '2'
    })

    try {
      const response = await fetch(`${baseUrl}?${params}`)
      const data = await response.json()

      if (data.code === 1 && data.music) {
        return data.music
      } else {
        console.error('API返回错误:', data)
        return null
      }
    } catch (error) {
      console.error('语音合成API调用失败:', error)
      return null
    }
  }

  async chuoyichuo (e) {
    if (cfg.masterQQ.includes(e.target_id)) {
      logger.info('[戳主人生效]')
      if (cfg.masterQQ.includes(e.operator_id) || e.self_id == e.operator_id) {
        return
      }
      e.reply([
        segment.at(e.operator_id),
        `\n戳戳戳戳你🐴呢，脑子有病就去看看！一天天就知道戳我家主人${master}, 胆子好大啊你`,
        segment.image(path + '/resources/chuochuo/1.gif')
      ], true)
      await common.sleep(1000)
      e.group.pokeMember(e.operator_id)
      return true
    }
    if (e.target_id == e.self_id) {
      logger.info('[戳一戳生效]')
      let count = await redis.get('Yz:pokecount:')
      let group = Bot.pickGroup(`${e.group_id}`, true)
      let usercount = mutetime - 1
      if (mutetime == 0) {
        usercount = await redis.get('Yz:pokecount' + e.operator_id + ':')
      }

      // 当前时间
      let time = moment(Date.now())
        .add(1, 'days')
        .format('YYYY-MM-DD 00:00:00')
      // 到明日零点的剩余秒数
      let exTime = Math.round(
        (new Date(time).getTime() - new Date().getTime()) / 1000
      )
      if (!count) {
        await redis.set('Yz:pokecount:', 1 * 1, { EX: exTime })// ${e.group_id}
      } else {
        await redis.set('Yz:pokecount:', ++count, {
          EX: exTime
        })
      }
      if (mutetime == 0) {
        if (!usercount) {
          await redis.set('Yz:pokecount' + e.operator_id + ':', 1 * 1, { EX: exTime })
        } else {
          await redis.set('Yz:pokecount' + e.operator_id + ':', ++usercount, { EX: exTime })
        }
      }
      if (Math.ceil(Math.random() * 100) <= 20 && count >= 10) {
        let conf = cfg.getGroup(e.group_id)
        e.reply([
          `${ciku_[Math.round(Math.random() * (ciku_.length - 1))]}`
            .replace('_name_', conf.botAlias[0])
            .replace('_num_', count)
        ])
        return true
      }
      // 生成0-100的随机数
      let random_type = Math.random()

      // 回复随机文字
      if (random_type < reply_text) {
        logger.info('[回复随机文字生效]')
        let text_number = Math.ceil(Math.random() * word_list.length)
        e.reply(word_list[text_number - 1])
      }

      // 回复随机图片
      else if (random_type < (reply_text + reply_img)) {
        logger.info('[回复随机图生效]')
        let photo_number = Math.ceil(Math.random() * (jpg_number + gif_number))
        let url = `https://moe.jitsu.top/img`
        let res = await fetch(url).catch((err) => logger.error(err))
        let msg = [segment.image(res.url)]
        if (photo_number <= jpg_number) {
          e.reply(segment.image(chuo_path + photo_number + '.jpg'))
        } else if (photo_number >= jpg_number) {
          photo_number = photo_number - jpg_number
          e.reply(segment.image(chuo_path + photo_number + '.gif'))
        } else {
          (
            await e.reply('给你一张图片别戳了，呜呜呜~' + msg)
          // await common.sleep(100)
          )
        }
      }

      // 回复随机语音
      else if (random_type < (reply_text + reply_img + reply_voice)) {
        logger.info('[回复随机语音生效]')
        let Text = voice[Math.floor(Math.random() * voice.length)]
        text = `${Text}` // 更新合成内容
        logger.info(`合成:${text}`)
        try {
          // 调用语音合成API
          const voiceUrl = await this.generateVoice(text, speakerapi1)

          if (voiceUrl) {
            // 直接发送语音到群聊
            e.reply(segment.record(voiceUrl))
          } else {
            logger.info('语音生成失败，可能为api失效捏~')
            // e.reply('语音生成失败')//能用再把双斜杠去了
          }
        } catch (error) {
          console.error('群语音回复错误:', error)
          e.reply('处理语音时发生错误')
        }
      }
      return true
    }
    // 禁言
    else if (random_type < (reply_text + reply_img + reply_voice + mutepick)) {
      if (cfg.masterQQ.includes(e.operator_id) || !group.is_admin) {
        fetch('https://api.xingdream.top/API/poke.php').then(Response => Response.json()).then(data => {
          if (data) {
            if (data.status == 200) {
              try {
                e.reply([segment.image(data.link)])
              } catch (err) {
                e.reply('图片获取失败，请检查网络链接或联系开发者。')
              }
            } else {
              e.reply(`获取图链失败，错误码：${data.status}`)
            }
          } else {
            e.reply('图片api异常。')
          }
        })
      }
      logger.info('[禁言生效]')
      logger.info(e.operator_id + `将要被禁言${usercount + 1}分钟`)
      if (usercount >= 36) {
        e.reply('我生气了！小黑屋冷静冷静')
        await common.sleep(1000)
        await e.group.muteMember(e.operator_id, 21600)
        return
      }
      // n种禁言方式，随机选一种
      let mutetype = Math.ceil(Math.random() * 4)
      if (mutetype == 1) {
        e.reply('我生气了！砸挖撸多!木大！木大木大！')
        await common.sleep(1000)
        await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
      }
      if (mutetype == 2) {
        e.reply('不！！')
        await common.sleep(1000)
        e.reply('准！！')
        await common.sleep(1000)
        e.reply('戳！！')
        await common.sleep(1000)
        await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
        await common.sleep(1000)
        e.reply('！！')
        return
      }
      if (mutetype == 3) {
        e.reply('吃我10068拳！')
        await common.sleep(1000)
        await e.group.pokeMember(e.operator_id)
        await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
        await common.sleep(1000)
        return
      }
      if (mutetype == 4) {
        e.reply('哼，我可是会还手的哦——')
        await common.sleep(1000)
        await e.group.pokeMember(e.operator_id)
        await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
      }
    }

    // 拍一拍表情包
    else if (random_type < (reply_text + reply_img + reply_voice + mutepick + example)) {
      await e.reply(await segment.image(`http://ovooa.com/API/face_pat/?QQ=${e.operator_id}`))
    }

    // 反击
    else {
      let mutetype = Math.round(Math.random() * 3)
      if (mutetype == 1) {
        e.reply('吃我一拳喵！')
        await common.sleep(1000)
        await e.group.pokeMember(e.operator_id)
      } else if (mutetype == 2) {
        e.reply('你刚刚是不是戳我了，你是坏蛋！我要戳回去，哼！！！')
        await common.sleep(1000)
        await e.group.pokeMember(e.operator_id)
      } else if (mutetype == 3) {
        e.reply('是不是要本萝莉揍你一顿才开心啊！！！')
        await common.sleep(1000)
        await e.group.pokeMember(e.operator_id)
      }
    }
  }
}
