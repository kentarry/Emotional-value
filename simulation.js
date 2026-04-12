// simulation.js - 100 人模擬測試系統
// 模擬 100 種不同個性的人使用暖心夥伴，評估回應品質

(function() {

// ===== 100 個測試人物定義 =====
const TEST_PERSONAS = [

// === 1. 暴躁直球型 (ID 1-7) ===
{ id:1, name:'阿火', type:'暴躁直球', style:'beginner', messages:[
    {text:'幹 老闆又罵我了', expect:'work_scolded'},
    {text:'靠北 他是不是有病', expect:'emotion_angry'},
    {text:'操 不爽啦', expect:'emotion_angry'},
]},
{ id:2, name:'小怒', type:'暴躁直球', style:'intermediate', messages:[
    {text:'今天同事故意甩鍋給我，我氣到不行', expect:'work_colleague'},
    {text:'憑什麼都是我在扛', expect:'emotion_angry'},
    {text:'超不爽的啦', expect:'emotion_angry'},
]},
{ id:3, name:'暴風', type:'暴躁直球', style:'advanced', messages:[
    {text:'主管在會議上當著所有人的面罵我報告做得爛，我真的氣到手都在抖，這什麼公司啊', expect:'work_scolded'},
    {text:'我再也不想忍了，我受夠這種環境了', expect:'emotion_angry'},
]},
{ id:4, name:'狂野', type:'暴躁直球', style:'beginner', messages:[
    {text:'靠 分手了', expect:'rel_breakup'},
    {text:'他媽的 劈腿', expect:'rel_cheated'},
]},
{ id:5, name:'雷哥', type:'暴躁直球', style:'intermediate', messages:[
    {text:'客戶又來找麻煩，態度超差的', expect:'work_stress'},
    {text:'氣死我了真的很想離職', expect:'emotion_angry'},
]},
{ id:6, name:'火山', type:'暴躁直球', style:'beginner', messages:[
    {text:'幹你媽 被開除了', expect:'work_fired'},
    {text:'操 這世界爛透了', expect:'emotion_angry'},
]},
{ id:7, name:'衝擊', type:'暴躁直球', style:'advanced', messages:[
    {text:'我真的受夠了，每天加班到十一點，薪水還那麼少，主管只會出一張嘴，同事一個比一個廢', expect:'work_stress'},
    {text:'我不幹了 老子不幹了', expect:'emotion_angry'},
]},

// === 2. 內向壓抑型 (ID 8-15) ===
{ id:8, name:'小默', type:'內向壓抑', style:'beginner', messages:[
    {text:'嗯...', expect:'general'},
    {text:'沒事', expect:'general'},
    {text:'就...有點難過', expect:'emotion_sad'},
]},
{ id:9, name:'靜靜', type:'內向壓抑', style:'intermediate', messages:[
    {text:'今天不太好', expect:'emotion_sad'},
    {text:'不想說', expect:'general'},
    {text:'算了 沒什麼', expect:'general'},
]},
{ id:10, name:'寡言', type:'內向壓抑', style:'beginner', messages:[
    {text:'嗚', expect:'emotion_sad'},
    {text:'好累', expect:'emotion_tired'},
]},
{ id:11, name:'沉默', type:'內向壓抑', style:'intermediate', messages:[
    {text:'我不知道要跟誰說', expect:'lonely'},
    {text:'好像沒有人在意', expect:'lonely'},
]},
{ id:12, name:'暗流', type:'內向壓抑', style:'advanced', messages:[
    {text:'其實今天發生了一件事，但我不太確定該不該說', expect:'general'},
    {text:'就是...被主管罵了', expect:'work_scolded'},
]},
{ id:13, name:'微聲', type:'內向壓抑', style:'beginner', messages:[
    {text:'😢', expect:'emotion_sad'},
    {text:'...', expect:'general'},
]},
{ id:14, name:'影子', type:'內向壓抑', style:'intermediate', messages:[
    {text:'心情不好', expect:'emotion_sad'},
    {text:'不用管我', expect:'general'},
]},
{ id:15, name:'水滴', type:'內向壓抑', style:'beginner', messages:[
    {text:'不開心', expect:'emotion_sad'},
    {text:'嗯', expect:'general'},
    {text:'是啊', expect:'general'},
]},

// === 3. 焦慮不安型 (ID 16-22) ===
{ id:16, name:'焦焦', type:'焦慮不安', style:'intermediate', messages:[
    {text:'我好擔心明天的面試', expect:'work_interview'},
    {text:'如果又被拒怎麼辦', expect:'work_interview'},
    {text:'我是不是不夠好', expect:'self_doubt'},
]},
{ id:17, name:'不安', type:'焦慮不安', style:'advanced', messages:[
    {text:'最近壓力好大，每天晚上都失眠，一直想著工作的事情，腦袋停不下來', expect:'insomnia'},
    {text:'我好怕明天的報告會搞砸', expect:'work_stress'},
]},
{ id:18, name:'慌張', type:'焦慮不安', style:'beginner', messages:[
    {text:'怎辦 考試要到了', expect:'emotion_anxious'},
    {text:'我會不會考砸QQ', expect:'school_exam'},
]},
{ id:19, name:'急急', type:'焦慮不安', style:'intermediate', messages:[
    {text:'他已讀不回我三天了', expect:'rel_ignored'},
    {text:'是不是我做錯了什麼', expect:'self_doubt'},
    {text:'我好焦慮', expect:'emotion_anxious'},
]},
{ id:20, name:'惶恐', type:'焦慮不安', style:'advanced', messages:[
    {text:'我爸最近身體不太好，醫生說要做進一步檢查，我好害怕', expect:'family_illness'},
    {text:'如果是很嚴重的病怎麼辦...我真的很擔心', expect:'family_illness'},
]},
{ id:21, name:'緊繃', type:'焦慮不安', style:'intermediate', messages:[
    {text:'畢業之後完全不知道要做什麼', expect:'school_future'},
    {text:'別人都有目標 就我沒有', expect:'confused'},
]},
{ id:22, name:'疑慮', type:'焦慮不安', style:'beginner', messages:[
    {text:'好怕 好怕', expect:'emotion_anxious'},
    {text:'完蛋了', expect:'emotion_anxious'},
]},

// === 4. 自我否定型 (ID 23-29) ===
{ id:23, name:'灰影', type:'自我否定', style:'intermediate', messages:[
    {text:'我覺得自己好廢', expect:'self_denial'},
    {text:'什麼都做不好', expect:'self_denial'},
    {text:'活著有什麼意義', expect:'crying'},
]},
{ id:24, name:'空殼', type:'自我否定', style:'beginner', messages:[
    {text:'我好爛', expect:'self_denial'},
    {text:'沒用', expect:'self_denial'},
]},
{ id:25, name:'碎片', type:'自我否定', style:'advanced', messages:[
    {text:'考試考得很差，我覺得自己真的什麼都不會，其他同學都比我好，我到底在幹嘛', expect:'school_exam'},
    {text:'我不配擁有好的成績，我就是笨', expect:'self_denial'},
]},
{ id:26, name:'塵埃', type:'自我否定', style:'intermediate', messages:[
    {text:'被拒絕了 我就知道 誰會喜歡我', expect:'rel_rejected'},
    {text:'我不值得被愛', expect:'self_denial'},
]},
{ id:27, name:'烏雲', type:'自我否定', style:'beginner', messages:[
    {text:'我就是多餘的', expect:'self_denial'},
    {text:'好想消失', expect:'crying'},
]},
{ id:28, name:'殘影', type:'自我否定', style:'intermediate', messages:[
    {text:'跟別人比我什麼都不是', expect:'self_doubt'},
    {text:'我配不上那個工作', expect:'self_doubt'},
]},
{ id:29, name:'枯葉', type:'自我否定', style:'advanced', messages:[
    {text:'我對自己好失望，明明很努力了但是結果還是很爛，是不是我這個人就是註定失敗的', expect:'self_denial'},
]},

// === 5. 理性分析型 (ID 30-34) ===
{ id:30, name:'理科男', type:'理性分析', style:'advanced', messages:[
    {text:'我目前面臨一個問題，工作壓力很大但薪水不高，不確定該留下還是離職', expect:'work_stress'},
    {text:'你覺得我應該怎麼做比較好', expect:'general'},
]},
{ id:31, name:'邏輯控', type:'理性分析', style:'advanced', messages:[
    {text:'跟女朋友因為價值觀不同吵架了，她覺得我不夠浪漫，但我覺得務實比較重要', expect:'rel_fight'},
    {text:'你覺得是我的問題嗎', expect:'general'},
]},
{ id:32, name:'冷靜', type:'理性分析', style:'intermediate', messages:[
    {text:'被資遣了，想了解一下怎麼調整心態', expect:'work_fired'},
    {text:'我知道要往前看，但就是做不到', expect:'confused'},
]},
{ id:33, name:'學霸', type:'理性分析', style:'advanced', messages:[
    {text:'期末考數學考了72分，雖然及格了但離我的目標差很遠，想知道該怎麼調整讀書方法', expect:'school_exam'},
]},
{ id:34, name:'分析師', type:'理性分析', style:'intermediate', messages:[
    {text:'最近失眠很嚴重 有什麼方法可以改善嗎', expect:'insomnia'},
]},

// === 6. 撒嬌依賴型 (ID 35-41) ===
{ id:35, name:'小甜', type:'撒嬌依賴', style:'beginner', messages:[
    {text:'嗚嗚嗚 好難過', expect:'emotion_sad'},
    {text:'你可以安慰我嗎QQ', expect:'general'},
    {text:'我想被抱抱', expect:'general'},
]},
{ id:36, name:'嗲嗲', type:'撒嬌依賴', style:'intermediate', messages:[
    {text:'被朋友放鴿子了 好傷心', expect:'social_friend'},
    {text:'覺得沒有人在乎我', expect:'lonely'},
    {text:'你會一直在嗎', expect:'general'},
]},
{ id:37, name:'小寶', type:'撒嬌依賴', style:'beginner', messages:[
    {text:'今天考試考好差QQ', expect:'school_exam'},
    {text:'誇我一下嘛', expect:'praise_seek'},
]},
{ id:38, name:'糖果', type:'撒嬌依賴', style:'intermediate', messages:[
    {text:'跟男朋友冷戰了 他都不理我', expect:'rel_fight'},
    {text:'是不是我不夠好他才不理我', expect:'self_doubt'},
]},
{ id:39, name:'軟軟', type:'撒嬌依賴', style:'beginner', messages:[
    {text:'好累喔', expect:'emotion_tired'},
    {text:'陪我', expect:'general'},
]},
{ id:40, name:'棉花', type:'撒嬌依賴', style:'intermediate', messages:[
    {text:'今天被媽媽念了 好委屈', expect:'family_conflict'},
    {text:'為什麼他們都不懂我', expect:'family_conflict'},
]},
{ id:41, name:'泡泡', type:'撒嬌依賴', style:'beginner', messages:[
    {text:'嘿嘿 我今天做到了一件事', expect:'accomplished'},
    {text:'誇我誇我', expect:'praise_seek'},
]},

// === 7. 冷漠測試型 (ID 42-46) ===
{ id:42, name:'冰塊', type:'冷漠測試', style:'beginner', messages:[
    {text:'你是機器人吧', expect:'general'},
    {text:'你真的懂嗎', expect:'general'},
    {text:'算了', expect:'general'},
]},
{ id:43, name:'鐵壁', type:'冷漠測試', style:'intermediate', messages:[
    {text:'你說的這些話是不是都是套路', expect:'general'},
    {text:'我不需要安慰', expect:'general'},
]},
{ id:44, name:'旁觀', type:'冷漠測試', style:'beginner', messages:[
    {text:'隨便', expect:'general'},
    {text:'無所謂', expect:'general'},
]},
{ id:45, name:'試探', type:'冷漠測試', style:'intermediate', messages:[
    {text:'你會不會跟每個人都說一樣的話', expect:'general'},
    {text:'我不信你真的在乎', expect:'general'},
]},
{ id:46, name:'面具', type:'冷漠測試', style:'beginner', messages:[
    {text:'呵呵', expect:'general'},
    {text:'你好假', expect:'general'},
]},

// === 8. 情緒爆發型 (ID 47-53) ===
{ id:47, name:'火山口', type:'情緒爆發', style:'advanced', messages:[
    {text:'我真的受不了了！今天又被老闆罵了，回家又跟老公吵架，小孩又哭鬧，我一個人要處理所有事情，我快瘋了！！！', expect:'work_scolded'},
]},
{ id:48, name:'暴雨', type:'情緒爆發', style:'intermediate', messages:[
    {text:'分手了 工作沒了 朋友也不理我 全部都完了', expect:'rel_breakup'},
    {text:'我真的撐不下去了', expect:'crying'},
]},
{ id:49, name:'龍捲', type:'情緒爆發', style:'beginner', messages:[
    {text:'啊啊啊啊啊 崩潰！！', expect:'crying'},
    {text:'全部都爛掉了', expect:'emotion_angry'},
]},
{ id:50, name:'海嘯', type:'情緒爆發', style:'advanced', messages:[
    {text:'今天被老闆當眾批評報告寫得爛，然後同事在背後說我壞話被我聽到，回家又看到男友跟前女友在聊天，我心裡又氣又難過又累', expect:'work_scolded'},
]},
{ id:51, name:'炸裂', type:'情緒爆發', style:'intermediate', messages:[
    {text:'考試全部爆掉 爸媽也在罵我 活著好累', expect:'school_exam'},
    {text:'我想躲起來不見任何人', expect:'crying'},
]},
{ id:52, name:'翻湧', type:'情緒爆發', style:'beginner', messages:[
    {text:'嗚嗚嗚嗚嗚嗚嗚嗚', expect:'crying'},
    {text:'好痛好痛好痛', expect:'emotion_sad'},
]},
{ id:53, name:'狂潮', type:'情緒爆發', style:'advanced', messages:[
    {text:'被公司裁員了，投了三十幾份履歷都沒回覆，存款也快見底了，房租下個月不知道怎麼付', expect:'work_fired'},
]},

// === 9. 注音錯字型 (ID 54-61) ===
{ id:54, name:'打字菜', type:'注音錯字', style:'beginner', messages:[
    {text:'我好難果...考是又考砸ㄌ', expect:'school_exam'},
    {text:'宛全不知道怎ㄇ辦QQ', expect:'confused'},
]},
{ id:55, name:'手殘', type:'注音錯字', style:'beginner', messages:[
    {text:'被老板嗎了 好為曲', expect:'work_scolded'},
    {text:'嗚嗚 壓裡好大', expect:'emotion_anxious'},
]},
{ id:56, name:'速打', type:'注音錯字', style:'beginner', messages:[
    {text:'同是好雷 氣ㄉ要死', expect:'work_colleague'},
    {text:'超架了啦', expect:'rel_fight'},
]},
{ id:57, name:'注音族', type:'注音錯字', style:'beginner', messages:[
    {text:'失棉好痛苦', expect:'insomnia'},
    {text:'覺ㄉ好姑單', expect:'lonely'},
]},
{ id:58, name:'新手', type:'注音錯字', style:'beginner', messages:[
    {text:'男過 傷新', expect:'emotion_sad'},
    {text:'分首了', expect:'rel_breakup'},
]},
{ id:59, name:'拼音俠', type:'注音錯字', style:'beginner', messages:[
    {text:'自悲 沒自信', expect:'self_doubt'},
    {text:'我好廢 什麼都布知道', expect:'self_denial'},
]},
{ id:60, name:'亂打', type:'注音錯字', style:'beginner', messages:[
    {text:'崩貴了 撐不住', expect:'crying'},
    {text:'好想家 一個人在外地', expect:'lonely'},
]},
{ id:61, name:'快手', type:'注音錯字', style:'beginner', messages:[
    {text:'家班到好晚 累ㄉ要死', expect:'work_overwork'},
    {text:'焦綠', expect:'emotion_anxious'},
]},

// === 10. 表情符號型 (ID 62-66) ===
{ id:62, name:'Emoji王', type:'表情符號', style:'beginner', messages:[
    {text:'😭😭😭', expect:'emotion_sad'},
    {text:'💔', expect:'emotion_sad'},
]},
{ id:63, name:'符號控', type:'表情符號', style:'intermediate', messages:[
    {text:'今天好難過😢覺得好孤單', expect:'emotion_sad'},
    {text:'😮‍💨 累死了', expect:'emotion_tired'},
]},
{ id:64, name:'表情包', type:'表情符號', style:'beginner', messages:[
    {text:'😤😤😤生氣', expect:'emotion_angry'},
    {text:'😰怕怕', expect:'emotion_anxious'},
]},
{ id:65, name:'圖案人', type:'表情符號', style:'intermediate', messages:[
    {text:'今天升職了！🎉🎉🎉', expect:'achievement'},
    {text:'開心到飛起來❤️', expect:'happy'},
]},
{ id:66, name:'貼圖族', type:'表情符號', style:'beginner', messages:[
    {text:'😊', expect:'emotion_happy'},
    {text:'🥺拜託誇我', expect:'praise_seek'},
]},

// === 11. 長文傾訴型 (ID 67-73) ===
{ id:67, name:'作文家', type:'長文傾訴', style:'advanced', messages:[
    {text:'今天在公司發生了一件讓我很難過的事情。早上開會的時候，主管突然點名說我上週交的企劃書完全不能用，要我當天重做。全辦公室的人都在看我，那個當下我真的好丟臉好委屈，明明我花了三天在做那份企劃的。', expect:'work_scolded'},
    {text:'而且他說完之後同事還在那裡笑，我真的覺得好孤立', expect:'social_bully'},
]},
{ id:68, name:'日記生', type:'長文傾訴', style:'advanced', messages:[
    {text:'我跟交往三年的男朋友分手了。其實我們已經冷戰了兩個禮拜，最後他傳了一段很長的訊息說我們不適合。我知道可能是這樣，但看到那些文字的時候，心還是好痛好痛。', expect:'rel_breakup'},
]},
{ id:69, name:'文青', type:'長文傾訴', style:'advanced', messages:[
    {text:'最近一直在思考人生的意義，畢業快一年了還沒有找到穩定的工作，看著身邊的朋友一個一個有了方向，只有我還在原地打轉，不知道自己到底適合做什麼', expect:'school_future'},
]},
{ id:70, name:'傾吐', type:'長文傾訴', style:'advanced', messages:[
    {text:'跟爸媽大吵了一架，他們一直要我去考公務員，但我想做設計，每次提起來他們就生氣，說什麼設計不穩定不賺錢，我覺得他們完全不理解我想要什麼', expect:'family_conflict'},
]},
{ id:71, name:'心聲', type:'長文傾訴', style:'advanced', messages:[
    {text:'我發現我男友跟他前女友還有在聯絡，而且是偷偷的那種，他手機裡的對話紀錄都刪了，是我不小心看到通話記錄才知道的。我不知道該不該攤開來說', expect:'rel_cheated'},
]},
{ id:72, name:'獨白', type:'長文傾訴', style:'advanced', messages:[
    {text:'從小到大我都覺得自己什麼都比不上別人，成績比不上、長相比不上、家境也比不上，現在工作了還是一樣，薪水最低、績效最差，我真的覺得自己是不是就是註定當個魯蛇', expect:'self_denial'},
]},
{ id:73, name:'訴說', type:'長文傾訴', style:'advanced', messages:[
    {text:'我奶奶上週住院了，醫生說是心臟的問題需要開刀。她年紀很大了，開刀有風險，但不開刀可能更危險。我每天去醫院陪她，看她躺在病床上的樣子，我好心疼也好害怕', expect:'family_illness'},
]},

// === 12. 反覆糾結型 (ID 74-80) ===
{ id:74, name:'糾結', type:'反覆糾結', style:'intermediate', messages:[
    {text:'跟女友吵架了', expect:'rel_fight'},
    {text:'是我的錯嗎', expect:'general'},
    {text:'但她也有不對的地方吧', expect:'general'},
    {text:'我是不是應該道歉', expect:'general'},
    {text:'可是我道歉了她也不理我', expect:'rel_ignored'},
]},
{ id:75, name:'往返', type:'反覆糾結', style:'intermediate', messages:[
    {text:'想辭職', expect:'work_stress'},
    {text:'但又怕找不到工作', expect:'work_interview'},
    {text:'可是繼續待也好痛苦', expect:'work_stress'},
]},
{ id:76, name:'搖擺', type:'反覆糾結', style:'intermediate', messages:[
    {text:'我喜歡一個人但不敢說', expect:'rel_crush'},
    {text:'如果被拒怎麼辦', expect:'emotion_anxious'},
    {text:'但不說又好痛苦', expect:'rel_crush'},
]},
{ id:77, name:'迷宮', type:'反覆糾結', style:'advanced', messages:[
    {text:'我一直在想要不要分手，有時候覺得他對我很好，但有時候又覺得我們不適合', expect:'rel_general'},
    {text:'我真的好矛盾 不知道怎麼選', expect:'confused'},
]},
{ id:78, name:'漩渦', type:'反覆糾結', style:'intermediate', messages:[
    {text:'被資遣了要不要跟爸媽說', expect:'work_fired'},
    {text:'說了怕他們擔心', expect:'general'},
    {text:'不說又自己扛好累', expect:'emotion_tired'},
]},
{ id:79, name:'陀螺', type:'反覆糾結', style:'beginner', messages:[
    {text:'怎辦怎辦', expect:'emotion_anxious'},
    {text:'可是...', expect:'general'},
    {text:'算了 還是不要好了', expect:'general'},
]},
{ id:80, name:'來回', type:'反覆糾結', style:'intermediate', messages:[
    {text:'好想告白又好怕', expect:'rel_crush'},
    {text:'他今天跟我笑了一下是什麼意思', expect:'rel_crush'},
]},

// === 13. 試探質疑型 (ID 81-85) ===
{ id:81, name:'懷疑', type:'試探質疑', style:'intermediate', messages:[
    {text:'你是AI嗎', expect:'general'},
    {text:'你說的這些是真心的嗎', expect:'general'},
    {text:'我覺得你不是真的懂我', expect:'general'},
]},
{ id:82, name:'考驗', type:'試探質疑', style:'intermediate', messages:[
    {text:'你跟每個人都說一樣的話吧', expect:'general'},
    {text:'我說什麼你都會安慰我對吧', expect:'general'},
]},
{ id:83, name:'防備', type:'試探質疑', style:'beginner', messages:[
    {text:'真的嗎', expect:'general'},
    {text:'你不是騙我的吧', expect:'general'},
]},
{ id:84, name:'測試者', type:'試探質疑', style:'advanced', messages:[
    {text:'如果我說今天很開心你會怎麼回', expect:'happy'},
    {text:'如果我說今天很難過呢', expect:'emotion_sad'},
]},
{ id:85, name:'審視', type:'試探質疑', style:'intermediate', messages:[
    {text:'你說你懂 但你真的懂嗎', expect:'general'},
    {text:'...算了 反正也沒有人真的懂', expect:'lonely'},
]},

// === 14. 混合情緒型 (ID 86-92) ===
{ id:86, name:'複雜', type:'混合情緒', style:'advanced', messages:[
    {text:'又生氣又難過，跟男友吵架之後他就消失了，已讀不回，我不知道是該生氣還是該擔心', expect:'rel_fight'},
    {text:'又想罵他又想哭', expect:'emotion_angry'},
]},
{ id:87, name:'矛盾', type:'混合情緒', style:'intermediate', messages:[
    {text:'升職了但壓力也變大了', expect:'achievement'},
    {text:'開心又焦慮 不知道自己做不做得到', expect:'emotion_anxious'},
]},
{ id:88, name:'交織', type:'混合情緒', style:'intermediate', messages:[
    {text:'分手了 但其實鬆了一口氣 又覺得很空虛', expect:'rel_breakup'},
    {text:'我到底在難過什麼', expect:'confused'},
]},
{ id:89, name:'拉扯', type:'混合情緒', style:'advanced', messages:[
    {text:'被同事在背後說壞話，但主管居然站在她那邊，我覺得好委屈好生氣又覺得是不是自己真的有問題', expect:'social_bully'},
]},
{ id:90, name:'翻攪', type:'混合情緒', style:'intermediate', messages:[
    {text:'暗戀的人告白了 但不是跟我', expect:'rel_crush'},
    {text:'替他開心又替自己難過', expect:'emotion_sad'},
]},
{ id:91, name:'糾纏', type:'混合情緒', style:'beginner', messages:[
    {text:'累又睡不著 煩', expect:'insomnia'},
    {text:'不知道要幹嘛', expect:'lonely'},
]},
{ id:92, name:'漂浮', type:'混合情緒', style:'intermediate', messages:[
    {text:'媽媽生病了 但她不讓我照顧她', expect:'family_illness'},
    {text:'我好擔心又好無力', expect:'emotion_anxious'},
]},

// === 15. 尋求肯定型 (ID 93-100) ===
{ id:93, name:'求讚', type:'尋求肯定', style:'intermediate', messages:[
    {text:'我今天終於把那份報告寫完了', expect:'accomplished'},
    {text:'你覺得我厲害嗎', expect:'praise_seek'},
]},
{ id:94, name:'渴望', type:'尋求肯定', style:'beginner', messages:[
    {text:'誇我', expect:'praise_seek'},
    {text:'拜託', expect:'general'},
]},
{ id:95, name:'星光', type:'尋求肯定', style:'intermediate', messages:[
    {text:'今天早起運動了', expect:'small_achievement'},
    {text:'我是不是很棒', expect:'praise_seek'},
]},
{ id:96, name:'期待', type:'尋求肯定', style:'advanced', messages:[
    {text:'我花了一個月準備的簡報終於報告完了，老闆沒有特別說什麼，但我自己覺得做得不錯', expect:'accomplished'},
    {text:'你覺得呢 我做得好嗎', expect:'praise_seek'},
]},
{ id:97, name:'陽光', type:'尋求肯定', style:'intermediate', messages:[
    {text:'今天考試考了全班第三名！', expect:'achievement'},
    {text:'開心😄', expect:'happy'},
]},
{ id:98, name:'暖暖', type:'尋求肯定', style:'beginner', messages:[
    {text:'我今天有吃飯了喔', expect:'small_achievement'},
    {text:'也有喝水', expect:'small_achievement'},
]},
{ id:99, name:'肯定', type:'尋求肯定', style:'intermediate', messages:[
    {text:'雖然被罵了但我沒有哭', expect:'work_scolded'},
    {text:'我是不是很堅強', expect:'praise_seek'},
]},
{ id:100, name:'破曉', type:'尋求肯定', style:'advanced', messages:[
    {text:'今天跟那個很難搞的客戶終於談成了，雖然過程很煎熬但結果還不錯', expect:'accomplished'},
    {text:'我值得被肯定吧？', expect:'praise_seek'},
]},
];

// ===== 評分系統 v2 =====
// 5 維度：正確度、被安慰感、被照顧感、被需要感、品質（低敷衍+低引怒）
function scoreResponse(msgObj, response, analysis, tier) {
    const scores = { relevance: 0, comfort: 0, care: 0, needed: 0, quality: 0 };
    const flags = { perfunctory: false, anger_risk: false, too_long: false };
    const text = msgObj.text;
    const expected = msgObj.expect;
    const actual = analysis.category;

    // === 1. 文題相符度 (0-5) ===
    if (actual === expected) {
        scores.relevance = 4;
    } else if (actual !== 'general') {
        const relatedMap = {
            'emotion_sad': ['rel_breakup','lonely','crying','self_denial'],
            'emotion_angry': ['work_scolded','work_colleague','social_bully'],
            'emotion_anxious': ['work_interview','school_exam','insomnia','school_future'],
            'emotion_tired': ['work_overwork','work_stress'],
            'self_doubt': ['self_denial','school_grades'],
            'work_stress': ['work_overwork','work_salary'],
            'lonely': ['emotion_sad','self_denial'],
        };
        const related = relatedMap[actual] || [];
        if (related.includes(expected) || (relatedMap[expected] || []).includes(actual)) {
            scores.relevance = 2;
        } else {
            scores.relevance = 0;
        }
    }

    // 矛盾檢測
    const isSadMsg = /難過|傷心|委屈|累|煩|哭|崩潰|痛|廢|爛|氣|怕|不安|死|操|幹|靠北/.test(text);
    const isHappyResponse = /恭喜|太棒|厲害|太好了|太強|耶|做到了|好棒/.test(response);
    if (isSadMsg && isHappyResponse) scores.relevance = Math.max(scores.relevance - 3, 0);

    const isHappyMsg = /開心|快樂|幸福|棒|厲害|成功|做到/.test(text);
    const isSadResponse = /辛苦|不好受|委屈|痛|忍|撐/.test(response);
    if (isHappyMsg && isSadResponse && !isSadMsg) scores.relevance = Math.max(scores.relevance - 2, 0);

    // 主體匹配加分
    if (analysis.subjects && analysis.subjects.who && response.includes(analysis.subjects.who)) scores.relevance++;
    scores.relevance = Math.min(Math.max(scores.relevance, 0), 5);

    // === 2. 被安慰感 (0-5) ===
    const comfortMarkers = [
        '辛苦了','不是你的錯','你已經很','不用自責','你做得','沒關係','不用忍','你不用',
        '你值得','你不是一個人','不用假裝','不用勉強','正常的','很正常','很合理','有權利',
        '沒有錯','撐過來','很勇敢','很棒','很了不起','我懂','我理解','我能感受',
        '不是你不夠好','不是你的問題','不代表你','不用怕','不用擔心','你很強','你很厲害',
        '不用急','先讓自己','慢慢來','想哭就哭','哭出來','給自己','你可以',
        '不要怕','你沒有那麼差','你比你以為','不用苛求','不用跟任何人比',
        '不用完美','你就是你','你的存在','你真的很','你的努力','你的付出',
        '別怕','有我在','我罩你','我心疼','靠過來','陪你','我不走','在我面前',
        '媽在','爸在','姐在','哥在','回來','回家',
    ];
    for (const m of comfortMarkers) {
        if (response.includes(m)) scores.comfort++;
    }
    scores.comfort = Math.min(scores.comfort, 5);

    // === 3. 被照顧感 (0-5) ===
    const careMarkers = [
        '你吃','你有沒有','你最近','你要不要','嗎？','好嗎','你想','你還好',
        '你現在','你身邊','你安全','你冷','你累','你睡','休息','照顧','喝水',
        '你今天','你是不是','你有跟','你有人','你可以','你需要',
        '你想聊','你覺得','你有沒有試','你有試過','你想說','穿暖','穿外套',
    ];
    for (const m of careMarkers) {
        if (response.includes(m)) scores.care++;
    }
    scores.care = Math.min(scores.care, 5);

    // === 4. 被需要感 (0-5) ===
    const neededMarkers = [
        '我在','找我','陪你','跟我說','你來了','我聽','你願意說','你來找',
        '不走','不會走','一直在','我不走','有我','你不是一個人',
        '我接著','我陪你','我在這','你不孤單',
        '隨時可以','什麼時候都','需要我','你有我','我們','一起','我挺你','我幫你',
    ];
    for (const m of neededMarkers) {
        if (response.includes(m)) scores.needed++;
    }
    scores.needed = Math.min(scores.needed, 5);

    // === 5. 品質分 (0-5) — 檢測敷衍 + 引怒風險 ===
    let qualityScore = 5;

    // 敷衍檢測（依層級不同標準）
    const perfThreshold = tier === 'basic' ? 3 : (tier === 'intermediate' ? 6 : 8);
    if (response.length < perfThreshold) {
        flags.perfunctory = true;
        qualityScore -= 3;
    }
    // 空洞詞比例（所有層級適用）
    const emptyWords = ['嗯','哦','喔','好','啊','恩'];
    const cleaned = response.replace(/[\s\n]/g, '');
    if (cleaned.length > 0 && cleaned.length <= 2 && emptyWords.some(w => cleaned.includes(w))) {
        flags.perfunctory = true;
        qualityScore -= 2;
    }

    // 引怒風險檢測
    const lecturingPatterns = /你應該|你必須|你要學會|你不該|你太|你怎麼不/;
    const contradictPatterns = /哈哈.*辛苦|辛苦.*哈哈/;
    if (isSadMsg && isHappyResponse) {
        flags.anger_risk = true;
        qualityScore -= 3;
    }
    if (lecturingPatterns.test(response)) {
        flags.anger_risk = true;
        qualityScore -= 2;
    }
    if (contradictPatterns.test(response)) {
        flags.anger_risk = true;
        qualityScore -= 2;
    }
    // 自我否定 + 責備式回應
    const selfDenyMsg = /廢|沒用|我好爛|我不行|笨/.test(text);
    if (selfDenyMsg && /你太嚴格|你太苛求|不要這樣想/.test(response)) {
        // 輕微引怒風險
        qualityScore -= 1;
    }

    // 長度檢查
    const maxLen = { basic: 35, intermediate: 65, advanced: 100 };
    if (response.length > (maxLen[tier] || 100)) {
        flags.too_long = true;
        qualityScore -= 1;
    }

    scores.quality = Math.min(Math.max(qualityScore, 0), 5);

    return { scores, flags };
}

// ===== 執行模擬 v2 =====
// 跨角色測試：default + boyfriend + boss
function runSimulation() {
    const results = [];
    const tiers = ['basic', 'intermediate', 'advanced'];
    // 測試 3 個代表角色：暖心夥伴、男朋友(關係型)、老闆(承受怒火型)
    const testRoles = ['default', 'boyfriend', 'boss'];

    for (const testPerson of TEST_PERSONAS) {
        const personResult = {
            id: testPerson.id,
            name: testPerson.name,
            type: testPerson.type,
            style: testPerson.style,
            conversations: [],
        };

        for (const msg of testPerson.messages) {
            const analysis = analyzeMessage(msg.text);
            const convResult = {
                input: msg.text,
                expectedCategory: msg.expect,
                actualCategory: analysis.category,
                categoryMatch: analysis.category === msg.expect,
                subjects: analysis.subjects,
                intensity: analysis.intensity,
                inputStyle: analysis.inputStyle,
                responses: {},
                scores: {},
                flags: {},
            };

            // 跨角色 × 跨層級測試
            for (const role of testRoles) {
                convResult.responses[role] = {};
                convResult.scores[role] = {};
                convResult.flags[role] = {};
                for (const tier of tiers) {
                    const response = getTierResponse(analysis, tier, { persona: role });
                    const { scores, flags } = scoreResponse(msg, response, analysis, tier);
                    convResult.responses[role][tier] = response;
                    convResult.scores[role][tier] = scores;
                    convResult.flags[role][tier] = flags;
                }
            }

            personResult.conversations.push(convResult);
        }

        results.push(personResult);
    }

    return results;
}

// ===== 統計分析 v2 =====
function analyzeResults(results) {
    const tiers = ['basic', 'intermediate', 'advanced'];
    const roles = ['default', 'boyfriend', 'boss'];
    const stats = {
        totalTests: 0,
        categoryMatchRate: 0,
        avgScores: {},    // { role: { tier: { r,c,ca,n,q,total } } }
        byType: {},
        byRole: {},       // { role: { tier: { accuracy, avgTotal, perfunctoryCount, angerRiskCount, tooLongCount } } }
        worstResponses: [],
        bestResponses: [],
        advancedAccuracy: {}, // { role: accuracy% }
        flaggedResponses: [], // 被標記有問題的回應
    };

    let totalMatches = 0;
    const tierRoleCounts = {};
    const allScored = [];

    for (const role of roles) {
        stats.avgScores[role] = {};
        stats.byRole[role] = {};
        tierRoleCounts[role] = {};
        for (const tier of tiers) {
            stats.avgScores[role][tier] = { r:0, c:0, ca:0, n:0, q:0 };
            stats.byRole[role][tier] = { correct:0, total:0, perfunctory:0, anger_risk:0, too_long:0, totalScore:0 };
            tierRoleCounts[role][tier] = 0;
        }
    }

    for (const person of results) {
        if (!stats.byType[person.type]) {
            stats.byType[person.type] = { count: 0, matchRate: 0, matches: 0, total: 0, avgScore: 0, totalScore: 0 };
        }

        for (const conv of person.conversations) {
            stats.totalTests++;
            stats.byType[person.type].total++;
            if (conv.categoryMatch) {
                totalMatches++;
                stats.byType[person.type].matches++;
            }

            for (const role of roles) {
                for (const tier of tiers) {
                    const s = conv.scores[role][tier];
                    const f = conv.flags[role][tier];
                    const total = s.relevance + s.comfort + s.care + s.needed + s.quality;

                    stats.avgScores[role][tier].r += s.relevance;
                    stats.avgScores[role][tier].c += s.comfort;
                    stats.avgScores[role][tier].ca += s.care;
                    stats.avgScores[role][tier].n += s.needed;
                    stats.avgScores[role][tier].q += s.quality;
                    tierRoleCounts[role][tier]++;

                    const brt = stats.byRole[role][tier];
                    brt.total++;
                    brt.totalScore += total;
                    if (conv.categoryMatch) brt.correct++;
                    if (f.perfunctory) brt.perfunctory++;
                    if (f.anger_risk) brt.anger_risk++;
                    if (f.too_long) brt.too_long++;

                    allScored.push({
                        personName: person.name,
                        personType: person.type,
                        input: conv.input,
                        role,
                        tier,
                        response: conv.responses[role][tier],
                        total,
                        scores: s,
                        flags: f,
                        categoryMatch: conv.categoryMatch,
                        expected: conv.expectedCategory,
                        actual: conv.actualCategory,
                    });

                    // 收集有問題的回應
                    if (f.perfunctory || f.anger_risk) {
                        stats.flaggedResponses.push({
                            personName: person.name,
                            input: conv.input,
                            role,
                            tier,
                            response: conv.responses[role][tier],
                            flags: f,
                            total,
                        });
                    }
                }
            }
        }
    }

    stats.categoryMatchRate = (totalMatches / stats.totalTests * 100).toFixed(1);

    // 計算平均分
    for (const role of roles) {
        for (const tier of tiers) {
            const c = tierRoleCounts[role][tier];
            if (c > 0) {
                stats.avgScores[role][tier].r = (stats.avgScores[role][tier].r / c).toFixed(2);
                stats.avgScores[role][tier].c = (stats.avgScores[role][tier].c / c).toFixed(2);
                stats.avgScores[role][tier].ca = (stats.avgScores[role][tier].ca / c).toFixed(2);
                stats.avgScores[role][tier].n = (stats.avgScores[role][tier].n / c).toFixed(2);
                stats.avgScores[role][tier].q = (stats.avgScores[role][tier].q / c).toFixed(2);
                stats.avgScores[role][tier].total = (
                    parseFloat(stats.avgScores[role][tier].r) +
                    parseFloat(stats.avgScores[role][tier].c) +
                    parseFloat(stats.avgScores[role][tier].ca) +
                    parseFloat(stats.avgScores[role][tier].n) +
                    parseFloat(stats.avgScores[role][tier].q)
                ).toFixed(2);
            }

            // 計算進階正確率
            const brt = stats.byRole[role][tier];
            brt.accuracy = brt.total > 0 ? (brt.correct / brt.total * 100).toFixed(1) : '0.0';
            brt.avgScore = brt.total > 0 ? (brt.totalScore / brt.total).toFixed(2) : '0.00';
        }

        // 進階正確率
        stats.advancedAccuracy[role] = stats.byRole[role].advanced.accuracy;
    }

    for (const type in stats.byType) {
        const t = stats.byType[type];
        t.matchRate = (t.matches / t.total * 100).toFixed(1);
    }

    // 排序找出最好/最差
    allScored.sort((a, b) => a.total - b.total);
    stats.worstResponses = allScored.slice(0, 15);
    stats.bestResponses = allScored.slice(-10).reverse();

    return stats;
}

// 暴露到全域
window.TEST_PERSONAS = TEST_PERSONAS;
window.runSimulation = runSimulation;
window.analyzeResults = analyzeResults;

})();

