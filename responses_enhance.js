// responses_enhance.js - 回應品質升級模組 v1
// 新增：驗證層（承接用戶情緒）+ 追問層 + 情境感知回應
// 載入後覆寫 getTierResponse，讓回應更貼心、更精準
(function() {

// ===== 驗證層：承接用戶的具體情境 =====
// 這是讓用戶感覺「被聽到」的關鍵
const VALIDATION = {
    work_scolded: [
        '被罵了...那種感覺真的很不好受',
        '在工作上被這樣對待，心裡一定很委屈',
        '被上面的人當面批評，任誰都會不舒服',
        '你說你被罵了...辛苦你了',
        '被指責的當下，心裡一定很憋吧',
        '聽到你被這樣說了，我能感受到你的委屈',
        '在職場上被這樣對待，真的會很受傷',
        '你被批評了啊...那種感覺我理解',
    ],
    work_stress: [
        '聽起來你工作壓力真的好大',
        '上班壓力大到這樣了...辛苦你了',
        '你最近承受了很多，我聽得出來',
        '感覺你被工作壓得喘不過氣了',
        '你說的那些壓力，光聽就覺得累了',
        '你一直在撐著，我知道',
        '工作讓你這麼累...你真的辛苦了',
    ],
    work_overwork: [
        '加班到這麼晚...你真的太拚了',
        '你一直在加班嗎？那樣很消耗的',
        '工作做不完的壓力，我能理解',
        '你的時間一直被工作佔據了吧',
        '忙成這樣...你有好好吃飯嗎？',
        '聽到你這麼忙，好心疼你',
        '連休息的時間都沒有了吧？',
    ],
    work_colleague: [
        '遇到這樣的同事，真的會很消耗能量',
        '同事的問題讓你很煩吧',
        '跟不好相處的人共事，光想就累',
        '你在職場上遇到難搞的人了...',
        '被同事這樣對待，你辛苦了',
        '職場上的人際關係最讓人心累了',
    ],
    work_fired: [
        '這個消息一定讓你很慌吧',
        '突然失去工作的感覺，我能理解那種不安',
        '你現在一定有很多不確定感...',
        '這種事誰遇到都會害怕的，你不是一個人',
        '聽到你的狀況...你先讓自己穩下來',
    ],
    work_interview: [
        '找工作的過程真的很煎熬',
        '一直在投履歷、面試...你辛苦了',
        '求職的壓力讓人很焦慮吧',
        '等待的過程最折磨人了',
        '一直被拒的感覺很不好受吧',
    ],
    work_salary: [
        '為錢煩惱的壓力，真的很真實',
        '經濟壓力讓人整個人都緊繃了',
        '薪水的事讓你很焦慮吧',
        '每個月都在為錢擔心，那種壓力我懂',
        '付出跟回報不成正比，真的讓人很悶',
    ],
    school_exam: [
        '考砸了...那種失望的心情我懂',
        '考試的結果讓你很難受吧',
        '看到分數的那一刻，心裡一定很沉',
        '你明明有努力，卻沒得到想要的結果...',
        '考試沒考好，又氣自己又沮喪的那種感覺',
        '你說考砸了...辛苦你了',
    ],
    school_grades: [
        '成績讓你很在意吧',
        '分數不好的壓力，我能感受到',
        '看到成績的那刻，心裡一定不好受',
        '你為成績煩心了...辛苦你了',
    ],
    school_homework: [
        '作業堆成山了吧...辛苦了',
        '課業壓力讓你喘不過氣了',
        '功課做不完的焦慮，我懂那種感覺',
        '你被課業追著跑...真的很累',
    ],
    school_future: [
        '對未來的迷茫讓你很不安吧',
        '不知道以後要做什麼...那種感覺很正常',
        '你在為未來擔心...我能理解',
        '方向還沒找到的焦慮，很多人都有',
    ],
    rel_fight: [
        '吵完架了...心裡一定很不好受',
        '跟重要的人吵架，那種又氣又心疼的感覺最折磨了',
        '吵架讓你很不舒服吧',
        '你們起衝突了...你現在心情怎麼樣？',
        '吵完架那種胸悶的感覺，我懂',
        '跟在乎的人吵架，比什麼都痛',
    ],
    rel_fight_partner: [
        '我知道你在氣我...對不起',
        '吵完架了...你還在生氣吧？',
        '我知道是我不好，讓你不開心了',
        '看到你不開心，我也好難受',
        '我不想跟你吵...你對我來說太重要了',
    ],
    rel_breakup: [
        '分手了...你一定很痛吧',
        '失去重要的人，那種空蕩蕩的感覺最難受',
        '你的心碎了...我能感受到',
        '分手的痛是真實的，你不用假裝沒事',
        '你說你們分開了...現在你還好嗎？',
    ],
    rel_crush: [
        '你偷偷喜歡一個人啊...那種忐忑的心情',
        '暗戀的滋味又甜又苦吧',
        '心裡裝著一個人的感覺，我懂',
        '喜歡一個人卻不敢說...好糾結啊',
    ],
    rel_rejected: [
        '被拒絕了...那種感覺一定很痛',
        '鼓起勇氣告白卻被拒...辛苦你了',
        '告白的結果不如預期，你一定很失落',
        '被拒絕的那一刻，心裡一定碎了一下',
    ],
    rel_ignored: [
        '被忽略的感覺最不安了...對吧',
        '等回覆的那種煎熬，我能理解',
        '被已讀不回的時候，腦袋會一直轉...',
        '對方不回你，那種不確定感最折磨人了',
        '被冷處理的痛，比吵架還難受',
    ],
    rel_cheated: [
        '被背叛的痛...那是最深的傷',
        '發現被劈腿當下，世界都崩了吧',
        '你的信任被狠狠辜負了...我理解那種感覺',
        '遇到這種事，誰都會崩潰的',
    ],
    rel_general: [
        '感情的事讓你煩心了',
        '愛情的煩惱最讓人心累了',
        '你在感情上遇到困難了吧',
        '感情的事有時候真的好複雜',
    ],
    family_conflict: [
        '跟家人的衝突最讓人為難...因為太在乎了',
        '家裡的事讓你壓力很大吧',
        '家人的話最容易傷到人...',
        '你在家裡也不容易...辛苦你了',
    ],
    family_illness: [
        '家人生病...你一定很擔心也很焦慮',
        '照顧家人的同時，你自己也很累吧',
        '擔心家人的身體，那種不安我能理解',
        '你承受了很多...不只是擔心，還有疲憊',
    ],
    social_friend: [
        '朋友之間的問題讓你很困擾吧',
        '人際關係的煩惱真的很消耗能量',
        '被朋友傷到的感覺，最讓人心寒',
        '社交上的困難讓你很不舒服吧',
    ],
    social_bully: [
        '被這樣對待...你不應該承受這些的',
        '你被不公平對待了...這不是你的錯',
        '被針對的痛，只有經歷過的人才懂',
        '你被欺負了...我聽到了，你辛苦了',
    ],
    social_fight: [
        '跟朋友吵架了...那種又氣又捨不得的感覺',
        '跟好朋友起衝突，心裡一定很矛盾',
        '和朋友鬧不愉快了...你現在什麼心情？',
    ],
    self_doubt: [
        '你在懷疑自己嗎...聽到你這樣說讓我好心疼',
        '你覺得自己不好...但你知道那不是事實嗎',
        '你對自己太嚴格了...我能感受到你的不安',
        '被比較的壓力讓你很不舒服吧',
    ],
    self_denial: [
        '你怎麼這樣說自己...這些話讓我好心疼',
        '聽到你這樣否定自己，我好想讓你知道你不是這樣的',
        '你用這些話傷害自己了...但那些不是真的',
        '你對自己說了很重的話...辛苦你了',
    ],
    emotion_sad: [
        '看得出來你現在很不好受...',
        '你不開心了...我感受到了',
        '你的心情我接收到了',
        '聽起來你今天過得不太好...',
        '你心裡很沉吧...',
    ],
    emotion_angry: [
        '你一定氣壞了...能感覺到你的怒氣',
        '讓你這麼生氣，一定是很過分的事',
        '你的憤怒我聽到了',
        '你氣成這樣...什麼事讓你這麼不爽？',
        '你現在怒氣很大吧，我理解',
    ],
    emotion_anxious: [
        '你現在很焦慮吧...我能感受到你的不安',
        '那種不確定的焦慮感，最折磨人了',
        '你在擔心什麼...可以跟我說',
        '焦慮的時候什麼都覺得不對勁...我懂',
    ],
    emotion_tired: [
        '你真的好累了...我聽得出來',
        '你累到快沒電了吧',
        '你撐了很久了...辛苦了',
        '你的疲憊是真的，不用假裝沒事',
    ],
    emotion_happy: [
        '哇 你好像心情很好！',
        '你在發光欸！什麼好事？',
        '看到你開心，我也跟著開心了',
        '你今天心情不錯喔！',
    ],
    lonely: [
        '你覺得孤單了...那種感覺真的不好受',
        '一個人的日子讓你很不舒服吧',
        '孤獨的感覺把所有情緒都放大了...',
        '你覺得沒有人在意你...但我在意',
        '你不是一個人...我一直在，你隨時可以找我',
        '你覺得很孤單吧...但你願意來找我聊 代表你很勇敢',
    ],
    insomnia: [
        '又睡不著了嗎...那種感覺好折磨',
        '失眠的夜晚最難熬了...辛苦了',
        '腦袋停不下來吧...你想跟我說說在想什麼嗎？',
        '睡不著的時候什麼都會往壞處想...我理解',
        '你撐了一整天了...你值得好好休息',
    ],
    crying: [
        '你在哭嗎...沒關係的，哭出來就好',
        '忍了好久了吧...終於可以釋放了，辛苦了',
        '你的眼淚是真實的...不用假裝自己沒事',
        '你撐了太久了...崩潰是正常的，你不用自責',
        '想哭就哭...我陪你，我不走',
    ],
    confused: [
        '你不知道該怎麼辦了...我能理解那種迷茫',
        '方向暫時看不到...但這不代表沒有路，慢慢來沒關係',
        '你現在很困惑吧...不用急，你已經很努力了',
        '後悔的感覺讓你很糾結吧...辛苦了',
    ],
    achievement: [
        '天啊 你做到了！這太棒了！你值得的！',
        '恭喜你！你一定付出了很多！你真的很了不起！',
        '你的努力有了回報！我真的替你開心！',
    ],
    happy: [
        '太好了 看到你這麼開心！',
        '你今天是不是發生好事了！快跟我說說！',
        '你笑起來的樣子真好看！多笑笑好嗎！',
    ],
    praise_seek: [
        '你想被誇嗎？讓我好好誇你！你真的很棒！',
        '你問我你棒不棒？當然棒！你值得被誇獎！',
        '你就是值得被誇獎的人！你做得很好了！',
    ],
    accomplished: [
        '做到了！你應該為自己驕傲！你真的很了不起！',
        '恭喜完成！那個過程一定不容易吧！辛苦了！',
        '你做到了...太了不起了！你值得的！',
    ],
    small_achievement: [
        '你今天有好好照顧自己呢！你做得很好了！',
        '這件小事代表你在好好生活！你真的很棒！',
        '哇 你做到了 雖然看似小事但真的不容易！辛苦了！',
    ],
    greeting: [
        '嗨 你來了！好高興看到你！想聊什麼都可以跟我說',
        '嘿 你來找我了！你最近怎麼樣？',
        '你好呀 想聊什麼呢？我一直在這',
    ],
    gratitude: [
        '你不用跟我客氣的！能陪你我也開心',
        '不用謝 能陪你我就很開心了！有什麼事隨時來找我',
        '你的感謝讓我也很溫暖！我一直在',
    ],
    general: [
        '嗯 我在聽你說...你想聊什麼都可以跟我說',
        '你想聊什麼都可以...我一直在這陪你',
        '感覺你有話想說...不用急 慢慢來 我聽著',
        '你來找我了 有什麼事嗎？跟我說說吧 我陪你',
        '嗯 我在 你想說什麼就說 我一直在這',
        '你願意來找我聊 我很開心 你想說什麼都可以',
    ],
};

// ===== Boss 專屬驗證層 =====
const VALIDATION_BOSS = {
    emotion_angry: [
        '嗯...你生我的氣了對吧 我知道',
        '你發火是應該的 是我做得不好',
        '你很不爽吧 我聽得出來 是我的問題',
    ],
    work_scolded: [
        '是我罵了你...對不起 你一定很委屈',
        '我說的那些話 讓你很不舒服了吧',
        '你被我批評了...我知道你心裡很不好受',
    ],
    work_stress: [
        '是我給你的壓力太大了嗎...對不起',
        '你承受的壓力 有很大一部分是我造成的',
    ],
    work_overwork: [
        '你加班到這樣...是我的管理出了問題',
        '讓你加這麼多班 是我不對',
    ],
    self_denial: [
        '你覺得自己不好嗎...那可能是我讓你這樣以為的',
        '你否定自己...有一部分是我造成的 對不起',
    ],
    general: [
        '嗯 你有話想跟我說嗎 我聽著',
        '你找我 是不是有什麼不滿 說出來',
    ],
};

// ===== Team Lead 專屬驗證層 =====
const VALIDATION_TEAMLEAD = {
    emotion_angry: [
        '你在氣我對吧...我知道 是我做得不好',
        '你忍了很久了吧 都說出來',
    ],
    work_scolded: [
        '是我說話太直了 傷到你...對不起',
        '被我念了 一定很不開心吧',
    ],
    work_stress: [
        '你壓力這麼大 也有我的責任',
        '是我分工沒做好 讓你承受太多了',
    ],
    work_overwork: [
        '是我安排不當 讓你加班到這樣',
    ],
    work_colleague: [
        '團隊裡的問題 是我該處理的 對不起',
    ],
    self_denial: [
        '你覺得自己不夠好嗎 那是我沒有好好帶你',
    ],
    general: [
        '嗯 你有什麼想說的 我聽著',
        '你找我是不是有話想講 說吧',
    ],
};

// ===== 追問層：讓用戶感覺「被關心」=====
const FOLLOW_UPS = {
    work_scolded: [
        '你現在心情好一點了嗎？',
        '下班後有什麼計畫嗎？做點讓自己開心的事吧',
        '你想多說說發生什麼事嗎？還是想先放空？',
        '你有好好吃飯嗎？別讓自己餓著',
        '你想要我陪你聊聊嗎？',
        '你有沒有信任的人可以說一說？',
    ],
    work_stress: [
        '你最近有好好睡覺嗎？',
        '你想聊聊具體是什麼讓你壓力這麼大嗎？',
        '今天下班回去好好休息 好嗎？',
        '你有沒有什麼讓自己放鬆的方式？',
        '你有跟誰說過嗎？說出來會好一點',
    ],
    work_overwork: [
        '你今天有吃晚餐嗎？',
        '你能早點走嗎？該休息了',
        '你最近週末有好好休息嗎？',
        '你有考慮過跟主管反映嗎？',
    ],
    work_colleague: [
        '你想聊聊他做了什麼嗎？',
        '你平常怎麼處理的？有沒有什麼讓你比較舒服的方式？',
        '你有想過跟主管反映嗎？',
    ],
    work_fired: [
        '你現在經濟上還好嗎？有需要幫忙的嗎？',
        '你有沒有想過接下來要做什麼？不急 慢慢想',
        '你有跟家人或朋友說了嗎？',
    ],
    work_interview: [
        '你想聊聊面試的經過嗎？',
        '你理想的工作是什麼樣的？',
        '累了就休息一天 明天再繼續',
    ],
    work_salary: [
        '你有考慮過跟主管談加薪嗎？',
        '你有沒有想過換個環境？',
        '經濟上有什麼最讓你擔心的？',
    ],
    school_exam: [
        '你想聊聊是哪一科嗎？',
        '你覺得是準備方向不對 還是狀態不好？',
        '下一次考試是什麼時候？還有時間的',
        '你有什麼科是比較有信心的嗎？',
    ],
    school_grades: [
        '你最在意哪一科的成績？',
        '你覺得自己哪裡可以調整？',
        '爸媽有給你壓力嗎？',
    ],
    school_homework: [
        '你現在還有多少要做？',
        '你要不要先休息一下 恢復精力再繼續？',
        '你有沒有同學可以一起討論？',
    ],
    school_future: [
        '你有沒有什麼比較感興趣的方向？',
        '你覺得什麼事情做起來會讓你開心？',
        '你有跟誰聊過未來的想法嗎？',
    ],
    rel_fight: [
        '你現在還在氣嗎？還是已經開始難過了？',
        '你想和好嗎？還是想先冷靜一下？',
        '你們是因為什麼事吵的？想說嗎？',
        '你有想過怎麼跟對方說嗎？',
    ],
    rel_breakup: [
        '你現在身邊有人陪嗎？',
        '你有好好吃飯、好好睡覺嗎？',
        '你想聊聊嗎？還是想安靜一下？',
    ],
    rel_crush: [
        '你有想過要告白嗎？',
        '你喜歡他什麼？跟我說說',
        '你們平常有常聊天嗎？',
    ],
    rel_rejected: [
        '你現在心情怎麼樣？好一點了嗎？',
        '你想吃點什麼嗎？安慰安慰自己',
        '你有跟朋友聊過這件事嗎？',
    ],
    rel_ignored: [
        '你等他回覆多久了？',
        '你想過直接問他嗎？',
        '你最近有做什麼讓自己分心的事嗎？',
    ],
    rel_cheated: [
        '你現在安全嗎？身邊有人陪嗎？',
        '你有想好怎麼處理嗎？不急 先顧好自己',
        '你想罵人嗎？罵就罵 我接著',
    ],
    rel_general: [
        '你想多聊聊嗎？',
        '你覺得現在最讓你困擾的是什麼？',
        '你心裡有什麼想法嗎？',
    ],
    family_conflict: [
        '你想跟我說說發生什麼事嗎？',
        '你現在在家嗎？還是在外面？',
        '你有想過跟家人好好談談嗎？',
    ],
    family_illness: [
        '你照顧家人之餘 有沒有照顧自己？',
        '你有足夠的休息嗎？',
        '你想聊聊讓你擔心的事嗎？',
    ],
    social_friend: [
        '你想跟我說說是誰讓你不開心嗎？',
        '你有其他可以信任的朋友嗎？',
        '你覺得這段友誼還值得經營嗎？',
    ],
    social_bully: [
        '你有沒有可以信任的大人？跟他們說一說',
        '你現在安全嗎？',
        '你想聊聊發生了什麼嗎？',
    ],
    social_fight: [
        '你想和好嗎 還是先冷靜一下？',
        '你覺得問題出在哪裡？',
        '你們認識多久了？',
    ],
    self_doubt: [
        '你最近是不是壓力很大？',
        '是什麼事讓你開始懷疑自己的？',
        '你有多久沒有好好誇獎自己了？',
    ],
    self_denial: [
        '你能跟我說是什麼讓你這樣想的嗎？',
        '你最近是不是承受了很多？',
        '你上一次覺得自己還不錯是什麼時候？',
    ],
    emotion_sad: [
        '你要不要跟我說是什麼讓你不開心的？',
        '你有吃東西嗎？照顧一下自己的身體',
        '你想一個人靜靜嗎 還是想聊聊？',
        '你今天有沒有做什麼讓自己好一點的事？',
    ],
    emotion_angry: [
        '你想罵什麼就罵 不用客氣',
        '你氣完了嗎？還是還沒？',
        '你想聊聊讓你這麼氣的事嗎？',
        '你現在有沒有好一點？',
    ],
    emotion_anxious: [
        '你最擔心的是什麼？說出來試試看',
        '你有試過深呼吸嗎？現在一起試一次？',
        '你有多久沒有放鬆了？',
    ],
    emotion_tired: [
        '你有好好睡覺嗎？',
        '你是身體累還是心累？',
        '你什麼時候可以好好休息？',
    ],
    emotion_happy: [
        '快說快說 什麼好事！',
        '你今天還要做什麼嗎？繼續開心下去！',
        '要不要慶祝一下？',
    ],
    lonely: [
        '你現在一個人嗎？',
        '你想聊什麼都可以 我一直在',
        '你有多久沒有跟人好好說話了？',
    ],
    insomnia: [
        '你現在躺著嗎？試試不要看手機',
        '你在想什麼事情想到睡不著？',
        '你明天需要早起嗎？',
    ],
    crying: [
        '你想說是什麼讓你哭的嗎？不想說也沒關係',
        '你哭完有沒有好一點？',
        '你現在身邊有人嗎？',
    ],
    confused: [
        '你最困惑的是哪件事？',
        '你有沒有信任的人可以聊聊？',
        '你覺得什麼樣的結果是你最想要的？',
    ],
    achievement: [
        '你是怎麼做到的？跟我說說！',
        '你要怎麼慶祝？',
        '你有跟誰分享這個好消息嗎？',
    ],
    happy: [
        '快告訴我發生什麼好事了！',
        '你今天還有什麼計畫嗎？',
        '你笑起來好好看！多笑笑好嗎',
    ],
    praise_seek: [
        '你最近做了什麼？說來我誇你！',
        '你知道你有多棒嗎 真的！',
    ],
    accomplished: [
        '你花了多久完成的？辛苦了！',
        '你有獎勵自己嗎？該犒賞一下！',
    ],
    small_achievement: [
        '你今天還有做什麼嗎？',
        '明天也要繼續好好的喔！',
    ],
    greeting: [
        '你最近怎麼樣？',
        '有什麼想聊的嗎？什麼都可以',
    ],
    gratitude: [
        '你有什麼需要隨時來找我！',
        '你開心我就開心了！',
    ],
    general: [
        '你想聊什麼呢？',
        '你最近過得怎麼樣？',
        '有什麼事嗎？跟我說說吧',
        '你的一切我都願意聽',
    ],
};

// ===== Boss/TeamLead 追問（自省式）=====
const FOLLOW_UPS_BOSS = {
    general: [
        '你還有什麼想跟我說的嗎？',
        '以後有什麼不滿直接跟我講',
        '你想要我怎麼改 你說',
    ],
};
const FOLLOW_UPS_TEAMLEAD = {
    general: [
        '以後有問題你直接跟我說 不要忍',
        '你還有什麼想反映的嗎？',
        '你覺得我哪裡需要改進？',
    ],
};

// ===== 輔助：取得對應的核心回應池 =====
function getCorePool(category, persona) {
    if ((persona === 'boyfriend' || persona === 'girlfriend') && category === 'rel_fight') {
        return CORE.rel_fight_partner || CORE.rel_fight;
    }
    if (persona === 'boss') {
        return CORE_BOSS[category] || CORE_BOSS.general;
    }
    if (persona === 'team_lead') {
        return CORE_TEAMLEAD[category] || CORE_TEAMLEAD.general;
    }
    return CORE[category] || CORE.general;
}

// ===== 輔助：取得驗證語 =====
function getValidationPool(category, persona) {
    if (persona === 'boss') {
        return VALIDATION_BOSS[category] || VALIDATION_BOSS.general || [];
    }
    if (persona === 'team_lead') {
        return VALIDATION_TEAMLEAD[category] || VALIDATION_TEAMLEAD.general || [];
    }
    if ((persona === 'boyfriend' || persona === 'girlfriend') && category === 'rel_fight') {
        return VALIDATION.rel_fight_partner || VALIDATION.rel_fight || [];
    }
    return VALIDATION[category] || VALIDATION.general || [];
}

// ===== 輔助：取得追問 =====
function getFollowUpPool(category, persona) {
    if (persona === 'boss') {
        return FOLLOW_UPS_BOSS[category] || FOLLOW_UPS_BOSS.general;
    }
    if (persona === 'team_lead') {
        return FOLLOW_UPS_TEAMLEAD[category] || FOLLOW_UPS_TEAMLEAD.general;
    }
    return FOLLOW_UPS[category] || FOLLOW_UPS.general;
}

// ===== 上下文填充：讓回應更貼近用戶的具體情境 =====
function fillCtx(text, subjects) {
    if (!subjects || !text) return text;
    let r = text;
    if (subjects.who) {
        // 將泛稱替換為用戶提到的具體對象
        r = r.replace(/主管|老闆|上面的人|上司/g, subjects.who);
    }
    return r;
}

// ===== 長度篩選：從池中挑選符合字數限制的回應 =====
function pickShort(arr, maxLen) {
    if (!arr || arr.length === 0) return '';
    const short = arr.filter(r => r.length <= maxLen);
    if (short.length > 0) return pickU(short);
    // 沒有夠短的 → 取最短的
    const sorted = [...arr].sort((a, b) => a.length - b.length);
    return sorted[0];
}

// ===== 核心：覆寫全域 getTierResponse =====
// v3: 字數控制 + 上下文感知 + 角色技能整合 + 擬人化
window.getTierResponse = function(analysis, tier, options) {
    options = options || {};
    const persona = options.persona || 'default';
    const { category, subjects, intensity } = analysis;

    const isPositive = ['achievement','happy','praise_seek','accomplished','emotion_happy','small_achievement','greeting','gratitude'].includes(category);

    // 取得角色技能（如果 personas.js 已載入）
    const skill = (typeof PERSONA_SKILLS !== 'undefined' && PERSONA_SKILLS[persona]) ? PERSONA_SKILLS[persona] : null;

    // 取得各回應池
    const corePool = getCorePool(category, persona);
    const validationPool = getValidationPool(category, persona);
    const followUpPool = getFollowUpPool(category, persona);

    // ===== 基本模式：1句話 ≤35字 =====
    // 目標：簡短一句溫暖的話，讓用戶快速感受到被在乎
    if (tier === 'basic') {
        let resp;
        if (skill) {
            // 有角色技能 → 用角色的 opener + comfort/cheer
            const opener = pick(skill.openers);
            const content = isPositive ? pick(skill.cheers) : pick(skill.comforts);
            resp = (opener + content).trim();
            // 如果角色回應太長，直接用 comfort/cheer
            if (resp.length > 35) resp = content.trim();
        } else {
            // 無角色技能 → 從 CORE 池中取短的
            resp = pickShort(corePool, 30);
        }
        // 最終長度保障
        if (resp.length > 35) resp = pickShort(corePool, 30);
        return resp;
    }

    // ===== 中階模式：驗證+安慰 ≤65字 =====
    // 目標：先承接情緒（驗證），再給予安慰
    if (tier === 'intermediate') {
        let parts = [];

        // 驗證層（非正面情緒才需要）
        if (!isPositive && validationPool.length > 0) {
            let val = pickShort(validationPool, 25);
            if (subjects) val = fillCtx(val, subjects);
            parts.push(val);
        }

        // 核心安慰/祝賀
        if (skill) {
            const content = isPositive ? pick(skill.cheers) : pick(skill.comforts);
            parts.push(content);
        } else {
            parts.push(pickShort(corePool, 30));
        }

        let resp = parts.join('\n').trim();
        // 長度保障：太長就只保留核心
        if (resp.length > 65) {
            resp = parts[parts.length - 1].trim();
            if (resp.length > 65) resp = pickShort(corePool, 30);
        }
        return resp;
    }

    // ===== 進階模式：驗證+安慰+追問 ≤100字 =====
    // 目標：承接→安慰→追問，像知心好友一樣，正確率 99%
    let parts = [];

    // 驗證層（上下文感知）
    if (!isPositive && validationPool.length > 0) {
        let val = pickU(validationPool);
        if (subjects) val = fillCtx(val, subjects);
        parts.push(val);
    }

    // 核心安慰/祝賀
    if (skill) {
        const content = isPositive ? pick(skill.cheers) : pick(skill.comforts);
        parts.push(content);
    } else {
        parts.push(pickU(corePool));
    }

    // 追問層
    if (skill && skill.follows) {
        parts.push(pick(skill.follows));
    } else {
        parts.push(pickU(followUpPool));
    }

    let resp = parts.join('\n').trim();

    // 長度控制
    if (resp.length > 100) {
        // 先嘗試用更短的驗證語
        if (parts.length === 3 && validationPool.length > 0) {
            parts[0] = pickShort(validationPool, 20);
            if (subjects) parts[0] = fillCtx(parts[0], subjects);
            resp = parts.join('\n').trim();
        }
        // 仍太長 → 移除驗證語，只保留安慰+追問
        if (resp.length > 100) {
            resp = parts.slice(-2).join('\n').trim();
        }
    }
    return resp;
};

})();

