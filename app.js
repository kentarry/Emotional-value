/**
 * 暖心夥伴 - Context Analysis Engine v2
 * 核心升級：主體提取、情緒強度偵測、打字風格辨識、擴充錯字修正
 */

// ===== 情境匹配規則 =====
const SITUATIONS = [
    // === WORK ===
    [/被(老闆|主管|上司|領導|經理|組長|課長|店長)(罵|批評|念|訓|嫌|兇|刁難|為難)/,'work_scolded','被主管批評'],
    [/(老闆|主管|上司|領導|經理).*(罵|批評|念|訓|嫌|兇|刁難)/,'work_scolded','被主管批評'],
    [/(罵|批評|念|訓|嫌|兇|刁難).*(老闆|主管|上司|領導)/,'work_scolded','被主管批評'],
    [/(加班|超時|做不完|趕不完|deadline|死線|好忙|忙到)/,'work_overwork','工作忙不完'],
    [/(同事|豬隊友|隊友|夥伴).*(雷|爛|氣|煩|討厭|不合|擺爛|推事|甩鍋)/,'work_colleague','同事的問題'],
    [/(被炒|被裁|裁員|失業|找不到工作|沒工作|被開除|被資遣|離職)/,'work_fired','工作上的打擊'],
    [/(面試|求職|找工作|投履歷|等通知|沒收到回覆)/,'work_interview','求職的壓力'],
    [/(薪水|薪資|待遇|錢不夠|月光|吃土|存不到錢).*(低|少|差|不好|不夠)/,'work_salary','薪資的煩惱'],
    [/(工作|上班|職場|公司).*(累|煩|壓力|不想|討厭|痛苦|沒動力|厭倦|倦怠)/,'work_stress','工作壓力'],
    [/(客戶|客人|奧客).*(難搞|機車|無理|奧|煩|刁難|兇)/,'work_stress','工作上被刁難'],
    [/(開會|meeting|簡報|報告|提案).*(爛|砸|失敗|不好|緊張|怕)/,'work_stress','工作上的挫折'],
    // === SCHOOL ===
    [/(考試|考卷|測驗|期中|期末|模考).*(砸|爛|差|沒考好|不好|掛|當|不及格|低)/,'school_exam','考試沒考好'],
    [/(砸|爛|差|沒考好|不好|掛|當|不及格).*(考試|考卷|測驗)/,'school_exam','考試沒考好'],
    [/(考砸|考爛|考差|考很爛|考很差|沒考好|考不好|考完了|考完|我考砸)/,'school_exam','考試沒考好'],
    [/(吵架|冷戰|鬧|生氣).*(了|很久|好幾天)/,'rel_fight','跟人吵架了'],
    [/跟你.*(吵|鬧|生氣|冷戰)|我們.*(吵|鬧|生氣|冷戰)/,'rel_fight','跟你吵架了'],
    [/(成績|分數|排名|名次).*(差|爛|低|不好|難看|退步|掉)/,'school_grades','成績不理想'],
    [/(作業|報告|論文|專題|功課|project).*(做不完|寫不完|好多|好難|煩|來不及)/,'school_homework','課業壓力'],
    [/(畢業|升學|轉學|考研|推甄|申請|留學).*(擔心|焦慮|怕|煩|壓力|迷茫)/,'school_future','學業前途的擔憂'],
    [/(被老師|被教授|被導師).*(罵|批評|念|訓|嫌|點名)/,'work_scolded','在學校被批評'],
    [/(上課|學習|讀書).*(煩|累|不想|沒動力|無聊|聽不懂)/,'school_homework','學習上的困擾'],
    // === RELATIONSHIP ===
    [/(分手|被甩|被分|情斷|結束了|散了|不要我了)/,'rel_breakup','分手的痛'],
    [/跟.*(男朋友|女朋友|男友|女友|另一半|對象|老公|老婆|伴侶).*(吵|鬧|冷戰|不開心)/,'rel_fight','跟另一半起衝突'],
    [/(男朋友|女朋友|男友|女友|另一半|對象|老公|老婆).*(吵|鬧|冷戰|不理|生氣|煩)/,'rel_fight','跟另一半起衝突'],
    [/(吵架|吵|冷戰|鬧|鬧脾氣).*(男朋友|女朋友|男友|女友|另一半|對象)/,'rel_fight','跟另一半起衝突'],
    [/(暗戀|喜歡一個人|單戀|不敢告白|偷偷喜歡|默默喜歡)/,'rel_crush','暗戀的心情'],
    [/(告白|表白|說喜歡).*(被拒|失敗|沒成功|拒絕|打槍)/,'rel_rejected','告白被拒'],
    [/(被拒|被打槍|被發好人卡)/,'rel_rejected','被拒絕的傷'],
    [/(已讀不回|不讀不回|不理我|不回我|不回訊息|故意不回|冷處理)/,'rel_ignored','被忽略的感覺'],
    [/(出軌|劈腿|第三者|小三|偷吃|外遇|綠|戴綠帽|背叛|找小三|外面有人|偷腥|偷人|養小三|搞外遇|偷偷交往)/,'rel_cheated','被背叛的痛'],
    [/(感情|愛情|戀愛|兩個人).*(不順|問題|煩|難|複雜|累|不知道)/,'rel_general','感情上的煩惱'],
    [/(想念|思念|好想).*(他|她|你|那個人)/,'rel_general','思念一個人'],
    [/(異地|遠距離|長距離)/,'rel_general','遠距離的辛苦'],
    // === FAMILY ===
    [/(爸|媽|父母|家人|家裡|爸媽|父親|母親).*(吵|罵|煩|壓力|管|控制|不理解|念|嫌|比較|逼)/,'family_conflict','家庭的壓力'],
    [/(爸|媽|父母|家人|爺爺|奶奶|外公|外婆).*(生病|住院|不舒服|身體|開刀|手術|癌)/,'family_illness','擔心家人的健康'],
    [/(父母|家人|爸媽).*(離婚|分開|吵架|打架|冷戰)/,'family_conflict','家庭的問題'],
    [/(家|家庭|家裡).*(煩|壓力|窒息|不想回|想逃|痛苦)/,'family_conflict','家庭的壓力'],
    // === SOCIAL ===
    [/(朋友|友誼|交友|社交).*(少|沒|不好|疏遠|背叛|假|虛偽|利用)/,'social_friend','人際關係的困擾'],
    [/(被排擠|被霸凌|被欺負|被笑|被嘲|被孤立|被針對|被說壞話|被八卦)/,'social_bully','被不公平對待'],
    [/(吵架|鬧翻|絕交|翻臉).*(朋友|好友|麻吉|閨蜜|兄弟)/,'social_fight','跟朋友的衝突'],
    [/(社恐|社交恐懼|不敢說話|害怕人群|不敢交朋友|很怕生)/,'social_friend','社交上的困難'],
    [/(被誤會|被冤枉|有口難言|說不清楚)/,'social_bully','被誤解的委屈'],
    // === SELF / EMOTIONS ===
    [/(覺得|感覺|好像|我).*(沒用|沒價值|廢|爛|笨|醜|胖|差|失敗|比不上|遜|弱)/,'self_doubt','對自己的懷疑'],
    [/(自卑|沒自信|不如人|配不上|不夠好|不配|不值得|什麼都不會|一無是處|沒能力)/,'self_doubt','對自己的懷疑'],
    [/(孤單|寂寞|孤獨|一個人|沒人陪|沒人在意|沒人懂|沒人理|沒人要|沒人愛)/,'lonely','孤單的感覺'],
    [/(失眠|睡不著|睡不好|整夜|熬夜|翻來覆去|半夜醒|凌晨|淺眠|做惡夢|噩夢)/,'insomnia','睡不好的困擾'],
    [/(想哭|哭了|一直哭|眼淚|淚|崩潰|撐不住|快瘋了|受不了了|爆哭|大哭)/,'crying','情緒崩潰'],
    [/(迷茫|茫然|不知道該怎麼辦|不知道怎麼辦|何去何從|沒方向|好迷惘|不知所措)/,'confused','感到迷茫'],
    [/(不知道.*做什麼|不知道.*方向|沒有目標|沒有方向|不確定.*未來|不知道.*適合)/,'confused','對未來的迷茫'],
    [/(想死|不想活|活著沒意義|生無可戀|沒有意義|好想消失|人間不值得)/,'crying','你說的這些我很在意'],
    [/(好焦慮|好緊張|好擔心|好害怕|好怕|好不安|好慌)/,'emotion_anxious','你很焦慮'],
    [/(怎麼辦|怎辦|完蛋|完了|糟了|慘了|死定了)/,'emotion_anxious','你很擔心'],
    [/(後悔|好後悔|早知道|如果當初|悔|不應該)/,'confused','心裡的後悔'],
    [/(丟臉|尷尬|出糗|社死|好丟人|好糗|好羞)/,'self_doubt','那種尷尬的感覺'],
    [/(被比較|被拿來比|輸給|不如|別人都|人家都)/,'self_doubt','被比較的壓力'],
    [/(嫉妒|羨慕|忌妒|酸|看不慣|為什麼不是我)/,'self_doubt','複雜的心情'],
    [/(無聊|好無聊|沒事做|不知道要幹嘛|空虛|虛無)/,'lonely','空虛無聊的感覺'],
    [/(想家|好想家|鄉愁|一個人在外地|異鄉|出門在外)/,'lonely','想家的心情'],
    [/(減肥|瘦不下來|身材|體重|胖|外貌焦慮|容貌焦慮)/,'self_doubt','對外表的焦慮'],
    [/(生病|不舒服|頭痛|肚子痛|感冒|發燒|身體差)/,'emotion_tired','身體不舒服'],
    [/(下雨|天氣差|好冷|好熱|天氣好差)/,'emotion_sad','天氣影響心情'],
    // === NEGATED POSITIVE → SAD (必須在 POSITIVE 之前) ===
    [/(不開心|不快樂|不高興|不幸福|不太好|不太開心|不太高興)/,'emotion_sad','你不開心了'],
    // === POSITIVE ===
    [/(升職|加薪|升遷|錄取|考上|上榜|得獎|獲獎|入選|通過|合格|考過)/,'achievement','你的成就'],
    [/(?<!不)(?<!不太)(開心|快樂|高興|幸福|太好了|超爽|超棒|好爽|太棒|太讚|真好|好幸運|好幸福)/,'happy','你的開心'],
    [/(想被誇|誇我|誇獎|讚美|我厲害嗎|我棒嗎|我好嗎|拜託誇一下|誇我誇我|誇誇我|求誇|求讚)/,'praise_seek','想被誇獎'],
    [/(你覺得我|我是不是很|覺得我).*(厲害|棒|堅強|勇敢|好|行|可以|不錯)/,'praise_seek','想被肯定'],
    [/(我值得|我做得好|我做得對|我夠好|拜託誇|求誇|求讚)/,'praise_seek','想被肯定'],
    [/(做得好嗎|做得對嗎|我棒不棒|我厲害不厲害|我是不是做得|我做得怎麼樣|你覺得呢.*做|做.*你覺得呢)/,'praise_seek','想被肯定'],
    [/(值得被肯定|值得被誇|我值得嗎|我可以嗎|我行嗎|我夠格嗎|我配嗎)/,'praise_seek','想被肯定'],
    [/(做到了|完成了|成功了|辦到了|搞定了|達成|畢業了|交出去了)/,'accomplished','你做到了的事'],
    [/(終於|終於.*完|終於.*了|終於.*成)/,'accomplished','你終於做到的事'],
    [/(寫完了|報告完了|交出去了|做完了|弄完了|弄好了|搞好了)/,'accomplished','你完成的事'],
    [/(戀愛了|在一起了|交往了|脫單|有對象了|告白成功)/,'happy','戀愛的喜悅'],
    [/(生日|過年|放假|假日|旅行|出去玩|吃大餐)/,'happy','開心的時光'],
    // === SMALL ACHIEVEMENTS (生活小事) ===
    [/(今天|剛剛|剛才|剛|有).*(洗臉|洗澡|刷牙|喝水|吃飯|吃東西|吃早餐|吃午餐|吃晚餐|出門|起床|運動|散步|跑步|整理|打掃|洗碗|洗衣|煮飯|做飯|讀書|寫作業|寫報告|練習|畫畫|彈琴|看書|澆花|餵貓|餵狗|遛狗|冥想|拉筋|伸展)/,'small_achievement','你做的小事'],
    [/(洗臉|洗澡|刷牙|喝水|吃飯|起床|運動|整理|打掃|洗碗|洗衣|煮飯|讀書|寫作業).*(了|完|好了|囉|啦)/,'small_achievement','你做的小事'],
    [/^(也有|還有).*(喝水|吃飯|吃東西|運動|洗澡|刷牙|起床|整理|打掃)/,'small_achievement','你做的小事'],
    // === SELF-DENIAL (自我否定) ===
    [/(我很廢|我好廢|我就廢|我就是廢|我就爛|我好爛|我真的很爛)/,'self_denial','你對自己說的話'],
    [/(我什麼都做不好|我什麼都不會|我好沒用|我真沒用|我就是沒用)/,'self_denial','你對自己說的話'],
    [/(活該|我活該|都是我的錯|我就是這樣|我改不了|我沒救了|放棄自己)/,'self_denial','你對自己說的話'],
    [/(我不配|我不值得|我不夠好|誰會喜歡我|沒人會愛我|我就是多餘的)/,'self_denial','你對自己說的話'],
    [/(不夠好|做不好|比不上|不如人|不如別人|什麼都不行|我不行|我做不到|我沒辦法)/,'self_denial','你對自己說的話'],
    [/(活著.*累|活著.*意義|活著.*沒意義|不想活|不想.*活)/,'crying','你說的話我很在意'],
    // === PROFANITY AS ANGER ===
    [/(幹你媽|幹你娘|操你媽|他媽的|媽的|靠北|靠腰|靠杯|機掰|雞掰|去死|狗屁|放屁|屁啦|王八蛋|混蛋|白癡|智障|廢物|垃圾|噁心|滾|滾開|去你的)/,'emotion_angry','很生氣'],
    [/^(幹|靠|操|屁|滾|媽的|靠北|機掰|雞掰|廢話|放屁|智障)[!！.。~～]*$/,'emotion_angry','很生氣'],
    // === GREETINGS ===
    [/^(你好|哈囉|嗨|安安|在嗎|早安|午安|晚安|hi|hello|hey|嘿|哈嘍|yo|嘻嘻)\s*[!！.。~～？?]?$/i,'greeting','打招呼'],
    [/^(在嗎|有人嗎|你在嗎|睡了嗎|忙嗎)\s*[？?]?$/i,'greeting','打招呼'],
    [/(謝謝|感謝|感恩|多謝|真的很謝謝|好溫暖|好窩心|你真好|好感動|thank)/i,'gratitude','感謝'],
];

// ===== 情緒關鍵字 =====
const EMOTION_KEYWORDS = {
    sad:['難過','傷心','心痛','痛苦','低落','沮喪','失落','心碎','悲傷','憂鬱','受傷','失望','無助','心酸','委屈','不開心','鬱悶','哀','慘','苦','嗚','嗚嗚','sad','hurt','depressed','upset','unhappy','😢','😭','💔'],
    angry:['生氣','憤怒','火大','暴怒','不爽','討厭','恨','氣死','抓狂','受夠了','超氣','靠','幹','怒','賭爛','不甘','憑什麼','angry','mad','hate','pissed','😤','😡','💢'],
    anxious:['焦慮','緊張','擔心','害怕','恐懼','不安','慌','壓力','喘不過氣','煩躁','煩','怕','怕怕','心慌','不確定','anxious','worried','scared','stress','nervous','panic','😰','😨'],
    tired:['累','疲倦','疲憊','沒力氣','筋疲力盡','身心俱疲','撐不住','無力','提不起勁','心累','倦','沒電','沒精神','沒幹勁','tired','exhausted','drained','burnout','😮‍💨','😩'],
    happy:['開心','快樂','高興','幸福','滿足','愉快','興奮','爽','棒','讚','耶','嘿嘿','happy','great','awesome','excited','joy','yay','😄','😊','🥰','🎉','❤️'],
};

// ===== 錯字修正表（大幅擴充）=====
const TYPO_MAP = {
    '難果':'難過','難遇':'難過','男過':'難過','難郭':'難過','難國':'難過',
    '傷新':'傷心','傷性':'傷心','上心':'傷心','商心':'傷心',
    '心同':'心痛','新痛':'心痛','心疼':'心痛','心通':'心痛',
    '分首':'分手','分收':'分手','紛手':'分手','份手':'分手',
    '考是':'考試','烤試':'考試','考式':'考試','靠試':'考試',
    '老板':'老闆','老半':'老闆','老版':'老闆','勞闆':'老闆',
    '上半':'上班','商班':'上班',
    '壓裡':'壓力','壓利':'壓力','鴨力':'壓力','雅力':'壓力',
    '焦綠':'焦慮','焦率':'焦慮','教慮':'焦慮','蕉慮':'焦慮',
    '失棉':'失眠','失勉':'失眠','師眠':'失眠','詩眠':'失眠',
    '孤丹':'孤單','姑單':'孤單','估單':'孤單',
    '寂摩':'寂寞','即寞':'寂寞','寂末':'寂寞','機寞':'寂寞',
    '自悲':'自卑','子卑':'自卑','字卑':'自卑','至卑':'自卑',
    '生器':'生氣','生起':'生氣','聲氣':'生氣','升氣':'生氣',
    '家班':'加班','佳班':'加班',
    '蓋架':'吵架','超架':'吵架','炒架':'吵架','抄架':'吵架',
    '同是':'同事','通事':'同事','銅事':'同事',
    '成機':'成績','程績':'成績','城績':'成績',
    '冷占':'冷戰','冷站':'冷戰','零戰':'冷戰',
    '暗練':'暗戀','安戀':'暗戀','按戀':'暗戀',
    '皮腿':'劈腿','批腿':'劈腿','披腿':'劈腿',
    '被嗎':'被罵','被馬':'被罵','被媽':'被罵',
    '崩貴':'崩潰','奔潰':'崩潰','崩愧':'崩潰','蹦潰':'崩潰',
    '委曲':'委屈','喂屈':'委屈','位屈':'委屈','為曲':'委屈',
    '工做':'工作','恐作':'工作',
    '不知到':'不知道','布知道':'不知道',
    '好向':'好像','好想':'好想',
    '怎ㄇ':'怎麼','怎莫':'怎麼','怎摩':'怎麼',
    '因為':'因為','因位':'因為',
    '沒關西':'沒關係','沒關系':'沒關係',
    '覺ㄉ':'覺得','覺的':'覺得',
    '開新':'開心','開欣':'開心',
    '朋有':'朋友','鵬友':'朋友',
    '影想':'影響','應響':'影響',
    '沒辦法':'沒辦法','沒半法':'沒辦法',
    // 模擬測試新增
    '宛全':'完全','完全':'完全',
    '好雷':'好雷',
    '氣ㄉ':'氣的','氣得':'氣的',
    '考砸ㄌ':'考砸了',
    '好為曲':'好委屈',
};

// ===== 錯字修正 =====
function normalizeTypos(text) {
    let t = text;
    // 注音快打修正
    t = t.replace(/ㄉ([的得])?/g, '的').replace(/ㄌ/g, '了').replace(/ㄇ/g, '麼').replace(/ㄋ/g, '你');
    t = t.replace(/ㄅ/g, '不').replace(/ㄏ/g, '好');
    for (const [typo, correct] of Object.entries(TYPO_MAP)) {
        if (t.includes(typo)) t = t.replace(new RegExp(typo, 'g'), correct);
    }
    return t;
}

// ===== 主體提取 =====
function extractSubjects(text) {
    const subjects = {};

    // WHO - 誰
    const whoPatterns = [
        [/(老闆|主管|上司|領導|經理|組長|課長|店長)/],
        [/(男朋友|男友)/], [/(女朋友|女友)/],
        [/(老公)/], [/(老婆)/],
        [/(另一半|對象|伴侶)/],
        [/(爸爸|父親)/], [/(媽媽|母親)/],
        [/(爸媽|父母|家人)/],
        [/(爺爺|奶奶|外公|外婆)/],
        [/(同事)/], [/(同學)/],
        [/(朋友|閨蜜|兄弟|好友|麻吉)/],
        [/(老師|教授|導師)/],
        [/(客戶|客人)/],
    ];
    for (const [regex] of whoPatterns) {
        const match = text.match(regex);
        if (match) { subjects.who = match[1]; break; }
    }

    // FEELING - 感受
    const feelingPatterns = [
        [/委屈/, '委屈'], [/難過/, '難過'], [/傷心/, '傷心'], [/心痛/, '心痛'],
        [/生氣/, '生氣'], [/憤怒/, '憤怒'], [/火大/, '火大'], [/不爽/, '不爽'],
        [/焦慮/, '焦慮'], [/緊張/, '緊張'], [/害怕/, '害怕'], [/不安/, '不安'],
        [/孤單/, '孤單'], [/寂寞/, '寂寞'], [/孤獨/, '孤獨'],
        [/累/, '累'], [/疲憊/, '疲憊'], [/疲倦/, '疲倦'], [/沒力/, '沒力氣'],
        [/崩潰/, '崩潰'], [/受不了/, '受不了'], [/撐不住/, '撐不住'],
        [/開心/, '開心'], [/高興/, '高興'], [/幸福/, '幸福'], [/快樂/, '快樂'],
        [/迷茫/, '迷茫'], [/困惑/, '困惑'], [/後悔/, '後悔'],
        [/無助/, '無助'], [/絕望/, '絕望'], [/痛苦/, '痛苦'],
        [/煩/, '煩'], [/討厭/, '討厭'], [/厭倦/, '厭倦'],
    ];
    for (const [regex, feeling] of feelingPatterns) {
        if (regex.test(text)) { subjects.feeling = feeling; break; }
    }

    // EVENT - 事件
    const eventPatterns = [
        [/被.*罵|被.*批評|被.*念|被.*訓/, '被罵了'],
        [/吵架|吵了|大吵/, '吵架了'],
        [/冷戰/, '冷戰了'],
        [/分手/, '分手了'],
        [/考砸|考差|考爛|沒考好/, '考砸了'],
        [/加班/, '加班'],
        [/失眠|睡不著/, '失眠'],
        [/被開除|被資遣|被裁/, '被開除了'],
        [/劈腿|出軌|外遇/, '被背叛了'],
        [/被拒|被打槍/, '被拒絕了'],
        [/已讀不回/, '被已讀不回'],
        [/被排擠|被霸凌|被欺負/, '被欺負了'],
        [/被誤會|被冤枉/, '被誤解了'],
        [/想哭|哭了|大哭|爆哭/, '想哭'],
        [/被忽略|不理我/, '被忽略了'],
    ];
    for (const [regex, event] of eventPatterns) {
        if (regex.test(text)) { subjects.event = event; break; }
    }

    return subjects;
}

// ===== 情緒強度偵測 (1-5) =====
function detectIntensity(text) {
    let score = 2;

    // 極端強度 (5)
    if (/想死|不想活|活著沒意義|生無可戀|想消失|人間不值得/.test(text)) return 5;
    if (/崩潰|受不了|快瘋|爆炸|爆哭|完蛋|毀了/.test(text)) score = Math.max(score, 4);

    // 高強度標記
    if (/!!!|！！！|好痛好痛|真的受不了|真的好/.test(text)) score = Math.max(score, 4);
    if (/幹你|操你|去死|王八/.test(text)) score = Math.max(score, 4);

    // 程度副詞加分
    const intensifiers = text.match(/很|好|超|太|非常|極度|超級|特別|根本|簡直|完全|一直|每天|總是|永遠/g);
    if (intensifiers) score = Math.min(score + Math.min(intensifiers.length, 2), 4);

    // 低強度
    if (/有點|稍微|還好|普通|一般|小小/.test(text)) score = Math.max(score - 1, 1);

    return Math.min(score, 5);
}

// ===== 打字風格辨識 =====
function detectInputStyle(originalText) {
    const len = originalText.length;
    const hasZhuyin = /[ㄅ-ㄩ]/.test(originalText);
    const hasNetSlang = /QQ|qq|ㄏㄏ|ㄎㄎ|ㄟ|ㄚ|ㄋ|ㄇ|ㄅ|ㄉ|ㄌ|orz|OTZ|xd|XD/i.test(originalText);
    const hasManyChinese = (originalText.match(/[\u4e00-\u9fff]/g) || []).length;
    const hasPunctuation = /[，。！？、；：「」]/.test(originalText);
    const sentenceCount = originalText.split(/[，。！？\n]/).filter(s => s.trim()).length;

    // 初階：短、注音、網路用語
    if (hasZhuyin || (len < 12 && hasNetSlang)) return 'beginner';
    if (len < 10 && !hasPunctuation) return 'beginner';

    // 進階：長文、有標點、多個句子
    if (len > 40 && hasPunctuation && sentenceCount >= 2) return 'advanced';
    if (len > 60 && hasManyChinese > 20) return 'advanced';

    return 'intermediate';
}

// ===== 核心分析函數（增強版 v3）=====
// 長文使用多關鍵字權重計分，短文使用首次匹配
function analyzeMessage(text) {
    const originalText = text.trim();
    const t = normalizeTypos(originalText);
    const inputStyle = detectInputStyle(originalText);
    const intensity = detectIntensity(t);
    const subjects = extractSubjects(t);

    // === 短文模式 (<30字)：首次匹配 ===
    if (t.length < 30) {
        for (const [regex, category, echo] of SITUATIONS) {
            if (regex.test(t)) {
                return { category, echo, source: 'situation', originalText, normalizedText: t, inputStyle, intensity, subjects };
            }
        }
    } else {
        // === 長文模式 (>=30字)：多關鍵字權重計分（增強版）===
        const categoryScores = {};
        const categoryEchos = {};

        // 高權重事件動作詞（出現這些時，對應分類大幅加分）
        const HIGH_WEIGHT_ACTIONS = {
            work_scolded: /被(老闆|主管|上司|領導|經理|組長|課長|店長|老師|教授).*(罵|批評|念|訓|嫌|兇|刁難|點名|當眾)/,
            rel_fight: /跟.*(男朋友|女朋友|男友|女友|老公|老婆|另一半|對象|伴侶).*(吵|鬧|冷戰)/,
            rel_breakup: /(分手|被甩|被分|不要我了)/,
            rel_cheated: /(劈腿|出軌|外遇|偷吃|背叛|第三者|小三|偷偷.*聊|偷偷.*聯絡|前女友.*聯絡|前男友.*聯絡|跟.*前女友|跟.*前男友)/,
            family_conflict: /(爸|媽|父母|家人|爸媽).*(吵|罵|逼|管|控制|不理解|壓力)/,
            family_illness: /(爸|媽|家人|爺爺|奶奶|外公|外婆).*(生病|住院|開刀|手術|不舒服|身體)/,
            work_fired: /(被炒|被裁|裁員|失業|被開除|被資遣)/,
            social_bully: /(被排擠|被霸凌|被欺負|被笑|被嘲|被孤立|被針對|在背後|說壞話|好孤立|覺得.*孤立|同事.*笑)/,
            school_exam: /(考試|考卷|測驗|期中|期末).*(砸|爛|差|不好|掛|不及格)/,
            school_future: /(畢業|升學|出社會).*(找不到|沒方向|不知道.*做什麼|迷茫|迷惘|沒有目標)/,
        };

        for (const [regex, category, echo] of SITUATIONS) {
            if (regex.test(t)) {
                categoryScores[category] = (categoryScores[category] || 0) + 1;
                if (!categoryEchos[category]) categoryEchos[category] = echo;
            }
        }

        // 高權重事件動作加分（+3）
        for (const [cat, regex] of Object.entries(HIGH_WEIGHT_ACTIONS)) {
            if (regex.test(t)) {
                categoryScores[cat] = (categoryScores[cat] || 0) + 3;
                if (!categoryEchos[cat]) categoryEchos[cat] = '';
            }
        }

        // === 長文專屬：衝突解決規則 ===
        // 1. 當「分手」明確出現時，rel_breakup 優先於 rel_fight
        if (/分手/.test(t) && categoryScores['rel_breakup'] && categoryScores['rel_fight']) {
            categoryScores['rel_breakup'] += 3;
        }
        // 2. 當整篇文章主旨是「自我否定/比不上別人」時，self_denial 優先
        const selfDenialCount = (t.match(/比不上|不如|不夠好|什麼都不|不值得|沒用|廢|爛|笨|失敗|多餘|不配|差|遜|弱/g) || []).length;
        if (selfDenialCount >= 3) {
            categoryScores['self_denial'] = (categoryScores['self_denial'] || 0) + selfDenialCount;
            if (!categoryEchos['self_denial']) categoryEchos['self_denial'] = '你對自己說的話';
        }
        // 3. 前女友/前男友 + 聯絡/聊天 → rel_cheated 大幅加權
        if (/前女友|前男友/.test(t) && /聯絡|聊天|聊|通話/.test(t)) {
            categoryScores['rel_cheated'] = (categoryScores['rel_cheated'] || 0) + 4;
            if (!categoryEchos['rel_cheated']) categoryEchos['rel_cheated'] = '被背叛的痛';
        }

        // 主體資訊加權
        if (subjects.who) {
            if (/老闆|主管|上司|領導|經理/.test(subjects.who)) {
                categoryScores['work_scolded'] = (categoryScores['work_scolded'] || 0) + 2;
                categoryScores['work_stress'] = (categoryScores['work_stress'] || 0) + 1;
            }
            if (/男朋友|男友|女朋友|女友|老公|老婆/.test(subjects.who)) {
                categoryScores['rel_fight'] = (categoryScores['rel_fight'] || 0) + 2;
                categoryScores['rel_breakup'] = (categoryScores['rel_breakup'] || 0) + 1;
                // 如果有出軌跡象，也加分
                if (/前女友|前男友|偷偷|刪/.test(t)) {
                    categoryScores['rel_cheated'] = (categoryScores['rel_cheated'] || 0) + 2;
                }
            }
            if (/爸|媽|父母|家人/.test(subjects.who)) {
                categoryScores['family_conflict'] = (categoryScores['family_conflict'] || 0) + 2;
            }
            if (/同事/.test(subjects.who)) {
                categoryScores['work_colleague'] = (categoryScores['work_colleague'] || 0) + 2;
            }
            if (/爺爺|奶奶|外公|外婆/.test(subjects.who)) {
                categoryScores['family_illness'] = (categoryScores['family_illness'] || 0) + 2;
            }
        }

        // 事件加權：如果有具體事件，降低模糊分類的權重
        const hasConcreteEvent = subjects.event && subjects.event !== '';
        if (hasConcreteEvent) {
            for (const vagueCat of ['self_doubt', 'emotion_sad', 'emotion_angry', 'general', 'confused']) {
                if (categoryScores[vagueCat] && categoryScores[vagueCat] > 0) {
                    const hasSpecific = Object.keys(categoryScores).some(k => 
                        !['self_doubt','self_denial','emotion_sad','emotion_angry','general','confused'].includes(k) && categoryScores[k] > 0
                    );
                    if (hasSpecific) {
                        categoryScores[vagueCat] = Math.max(categoryScores[vagueCat] - 2, 0);
                    }
                }
            }
        }

        // 長文：work_salary 在自我否定語境下降權
        if (selfDenialCount >= 2 && categoryScores['work_salary']) {
            categoryScores['work_salary'] = Math.max(categoryScores['work_salary'] - 2, 0);
        }

        // 找最高分的分類
        if (Object.keys(categoryScores).length > 0) {
            let best = null, bestScore = 0;
            for (const [cat, score] of Object.entries(categoryScores)) {
                if (score > bestScore) { best = cat; bestScore = score; }
            }
            return { category: best, echo: categoryEchos[best] || '', source: 'situation_scored', originalText, normalizedText: t, inputStyle, intensity, subjects };
        }
    }

    // === EMOTION_KEYWORDS 匹配（含否定詞處理）===
    const NEGATORS = ['不','沒','別','未','非','無','莫'];
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
        for (const kw of keywords) {
            const idx = t.toLowerCase().indexOf(kw.toLowerCase());
            if (idx !== -1) {
                const prefix = t.substring(Math.max(0, idx - 2), idx);
                const isNegated = NEGATORS.some(neg => prefix.includes(neg));
                if (isNegated && emotion === 'happy') {
                    return { category: 'emotion_sad', echo: extractEcho(t, kw), source: 'emotion', originalText, normalizedText: t, inputStyle, intensity, subjects };
                }
                if (!isNegated || emotion !== 'happy') {
                    return { category: `emotion_${emotion}`, echo: extractEcho(t, kw), source: 'emotion', originalText, normalizedText: t, inputStyle, intensity, subjects };
                }
            }
        }
    }
    return { category: 'general', echo: t.length > 20 ? t.substring(0,20)+'...' : t, source: 'general', originalText, normalizedText: t, inputStyle, intensity, subjects };
}

// ===== Echo 提取 =====
function extractEcho(text, matchedKeyword) {
    const idx = text.indexOf(matchedKeyword);
    if (idx === -1) return text.substring(0, 20);
    const start = Math.max(0, idx - 10);
    const end = Math.min(text.length, idx + matchedKeyword.length + 10);
    let phrase = text.substring(start, end).trim();
    if (phrase.length > 30) phrase = phrase.substring(0, 30) + '...';
    return phrase;
}
