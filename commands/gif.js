exports.run = (client, message) => {
  try {
    if (!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) return message.channel.send(`> I can't send you gifs because I don't have permissions to attach files to my messages, <@${message.author.id}>.`);

    Array.prototype.pick = function () {
      return this[Math.floor(Math.random() * this.length)];
    };

    let helpText = `> **Pokémon:**
    > Squirtle, Slowpoke, Flareon, Snorlax, Wooper, Scizor, Heracross, Torchic, Lotad, Turtwig, Chimchar, Piplup, Shinx, Pachirisu, Gible, Glaceon, Gliscor, Gallade, Maractus, Reshiram
    
    > **Not Pokémon:**
    > Dango, Jojo, Stitch
    
    > **Interactions/Emotions:**
    > Hug`;

    let gifs = {
      //// Pokémon
      // Squirtle DexNr. 007
      squirtle: [
        "http://media.tumblr.com/3393cf4f82933c5ca0a5e23797a006d3/tumblr_mjmpsh0S9k1r6nfvjo1_500.gif",
        "https://media.tumblr.com/4ce496c0f612e4471f9e972b1589cfc7/tumblr_mz1wc0pQqo1tp9ck7o1_500.gif",
        "http://media.tumblr.com/tumblr_m22ue3qYTj1ql5an1o1_500.gif",
        "https://media.tumblr.com/2e7480b053a88c30bc923cddb5bbaf88/tumblr_miabae0Mk51qdtuqno1_500.gif",
        "http://media.tumblr.com/1961dd95c3818deb83b5f2107dd24492/tumblr_ncy6qrNwt31rey868o1_500.gif",
        "http://media.tumblr.com/21ad8bf1c1a01298983cabb81067d75d/tumblr_mjbjjymH4W1r72ht7o1_500.gif",
        "http://media.tumblr.com/398e3aceb391ddd46145029fe40b2cb2/tumblr_na33l3bL6U1toiaw4o1_500.gif",
        "https://media.tumblr.com/8b48f1d5b2302ffd18fb14e3247c4844/tumblr_nl8n5hez6q1qfjr5zo1_500.gif",
        "https://media.tenor.com/images/b7eedef7b73e0dac613241661df347d7/tenor.gif",
        "http://media.tumblr.com/bf9f2193d66a20a51ce5aae4c689a1c3/tumblr_n42m8gv34q1rjenv2o1_500.gif",
        "http://media.tumblr.com/c0a7aa296965de179e3a9990d4adb518/tumblr_meqj0agSkv1r26jxbo1_500.gif",
        "https://media.tumblr.com/a67db62a6c7a0c8e9ef50f04f8cde847/tumblr_npjl682uH81unqh53o4_400.gif",
        "https://media.giphy.com/media/uRROb0WYxnPoc/giphy.gif",
        "http://media.tumblr.com/72da3491bd99d063202d65ffe89fe1f5/tumblr_nm5j5srwGh1rey868o1_500.gif",
        "https://i.pinimg.com/originals/a2/30/20/a23020ad9d00a5ba100f2264e2e751c6.gif",
        "https://media.giphy.com/media/awRutawdcWLJe/giphy.gif",
        "https://media.giphy.com/media/uRSX5PcJcwV68/giphy.gif",
        "https://media.tumblr.com/4b864411aaf48059c06fd44513c96a47/tumblr_nsorzbuLkJ1r8sc3ro1_r1_500.gif",
        "https://media.giphy.com/media/7mLXZL4UlLf1K/giphy.gif",
        "https://thumbs.gfycat.com/HeavenlyBrightCollardlizard-size_restricted.gif",
        "https://ugc.reveliststatic.com/gen/full/2016/07/12/14/eq/cf/phpuk05tcs2qbwe.gif"
      ],
      // Slowpoke DexNr. 079
      slowpoke: [
        "https://media.giphy.com/media/AAY5orhYr4TdK/giphy.gif",
        "https://media.giphy.com/media/12YlcIDRmrdMNq/giphy.gif",
        "https://media.giphy.com/media/lgIyvBoSKEhuo/giphy.gif",
        "https://media.tenor.com/images/d94fe4bd4546d2c923eaf41a6e78b035/tenor.gif",
        "https://media.tenor.com/images/a74735542739547c8d4e2b5fac7c5588/tenor.gif",
        "https://media.giphy.com/media/5Un02nicFCIqA/giphy.gif",
        "https://media.tenor.com/images/55f2d2c966b32a3836f34ad0a04b86b5/tenor.gif",
        "http://media.tumblr.com/tumblr_meqraqg0y51qfl09z.gif",
        "https://thumbs.gfycat.com/EminentGreedyAndalusianhorse-small.gif"
      ],
      // Flareon DexNr. 136
      flareon: [
        "https://media.tenor.com/images/e8d68a1ea84856f5eb2bd23b17bf47ee/tenor.gif",
        "https://media.tenor.com/images/857ba14c98c405cbdb097723357fe793/tenor.gif",
        "https://media.tenor.com/images/df0cb3e0747c1a96ed045b950ad8ea7a/tenor.gif",
        "https://media.tenor.com/images/a576c18e4d32091502d2e7acfef9e2fc/tenor.gif",
        "https://media.tenor.com/images/85f252feb659d588489fb68cb4b052d5/tenor.gif",
        "https://media.tenor.com/images/1c010877b6816fdd9656ae5c4e96bbcf/tenor.gif",
        "https://thumbs.gfycat.com/OrangeBlueDalmatian-size_restricted.gif",
        "https://pa1.narvii.com/6533/9221fb480ab50b2211ab5e1cd40736931dc144e3_hq.gif",
        "https://cdn.discordapp.com/attachments/599180353441366026/625487752527347722/flareongif1.gif"
      ],
      // Snorlax DexNr. 143
      snorlax: [
        "https://media.giphy.com/media/Ev2Ov4wBz9Ogg/giphy.gif",
        "https://media.giphy.com/media/l3vQXn15dRVNMru7e/giphy.gif",
        "https://media.giphy.com/media/5RxNQCK01NdAc/giphy.gif",
        "https://media.giphy.com/media/CXaDzPow0SJqM/giphy.gif",
        "https://media.giphy.com/media/14nG1hm40I2UCY/giphy.gif",
        "https://media.giphy.com/media/T9ep0ZVwtON0Y/giphy.gif",
        "https://media.giphy.com/media/qdFCb59rXKZ1K/giphy.gif",
        "https://media.giphy.com/media/hllwtNe9cnAeA/source.gif",
        "https://pa1.narvii.com/5687/afee5659818479ca8f17b4f6714462e3db3c42a1_hq.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335919202533406/giphy_2.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335922004066312/HalfLittleCuscus-small.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335937778843738/tumblr_m04l6tgKLz1r4xd9jo1_500.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335952115105802/TrfM1Fh.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335968716161044/tumblr_m9xm4z0GZK1rnln23o1_500.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335971379675176/giphy_4.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335978807525400/giphy_6.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335986684559433/HollowMiserableErne-max-1mb.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335992544002048/fc63ca4cdf6a7f0b-content-of-gift-boxes-from-phase-2-of-the-event-otakukart.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641335993210765312/78e37f2165cb7cb41dc73c921a4b685a.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641336007148699676/giphy_5.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641336010885824532/source.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641336012772999178/source_1.gif",
        "https://cdn.discordapp.com/attachments/641335699601358856/641336171640651782/source.gif"
      ],
      // Wooper DexNr. 194
      wooper: [
        "http://i.imgur.com/VOKPenb.gif",
        "https://media.giphy.com/media/13ErhPzkOJoty/giphy.gif",
        "https://media.giphy.com/media/nhNa1pj7kYVi0/giphy.gif",
        "https://i.pinimg.com/originals/89/00/34/89003420c54d6b304be5d7ed7ebdf4c7.gif",
        "https://thumbs.gfycat.com/ForcefulDiligentHoneybee-small.gif",
        "https://i.pinimg.com/originals/c7/b2/32/c7b2320c583e6b08069465f2e3570075.gif",
        "https://media.tumblr.com/fbe3d87fdf2e9e4e24941a3b36c0781f/tumblr_ori5yo2mIj1vhvnzyo1_400.gif",
        "https://i.imgur.com/JAzs0iP.gif",
        "http://media.tumblr.com/tumblr_m9b5jpGplP1qcm0wfo1_500.gif",
        "https://media.giphy.com/media/10VKWqp5QHEpc4/giphy.gif",
        "https://thumbs.gfycat.com/CoordinatedDescriptiveAlabamamapturtle-small.gif",
        "https://media.tumblr.com/f8ad9d7ce9d1432b574951f7c616c368/tumblr_nxk4pjBhDg1tqptlzo1_500.gif",
        "https://media.tumblr.com/f097cb1f27e986cffca34d50dfbad8b3/tumblr_nxk4pjBhDg1tqptlzo2_500.gif",
        "https://media.tenor.com/images/160a719e7182123c715bf63b8a4d0269/tenor.gif?itemid=7178145",
        "https://media.tumblr.com/c2c5ccd1854065134127795e6a1edaf7/tumblr_nnne81Vigx1qfjr5zo1_400.gif",
        "http://i.imgur.com/uQhro.gif",
        "https://static.fjcdn.com/gifs/An_df96da_5425362.gif",
        "http://media.tumblr.com/tumblr_ljk1xdrdjX1qfjerio1_500.gif",
        "https://sixprizes.com/wp-content/uploads/2016/06/wooper-tightrope-walk-confident-happy.gif"
      ],
      // Scizor DexNr. 212
      scizor: [
        "https://media.giphy.com/media/pIG4Dds2aEGIg/giphy.gif",
        "https://thumbs.gfycat.com/OpenInsignificantAxolotl-size_restricted.gif",
        "https://pa1.narvii.com/6389/bcf868b12c5fb81e958b05db599e87e7672ad452_hq.gif",
        "https://archive-media-0.nyafuu.org/vp/image/1506/24/1506243095242.gif",
        "https://media.giphy.com/media/LkcSpYZNgz4Zy/giphy.gif",
        "https://pa1.narvii.com/6270/edb05b52a0ce00d767909d4171036faab3619e88_hq.gif",
        "https://media.tumblr.com/82af9c0fa09e680407c6d9c656f657c8/tumblr_mg0hgvSH4M1rc2uczo8_250.gif"
      ],
      // Heracross DexNr. 214
      heracross: [
        "http://pa1.narvii.com/5875/05d79c61831339336344c875959689dcd02e8d5a_00.gif",
        "http://pa1.narvii.com/5740/fd9f625f90a74db8bd484e88f5a5023a5f52e7e7_00.gif",
        "https://pa1.narvii.com/5807/9521fd748a9dd01d3f7444b0c6cc610ac5554cbe_hq.gif",
        "https://media.giphy.com/media/T726Xfs8br06Q/giphy.gif",
        "https://vignette.wikia.nocookie.net/pokemonfanon/images/0/03/Venusaur_Heracross.gif",
        "https://pa1.narvii.com/5807/94885714653e3bc09f11619a7e53e9e3a20b6051_hq.gif",
        "https://archive-media-0.nyafuu.org/vp/image/1556/68/1556685719593.gif",
        "https://2.bp.blogspot.com/-cG4FA7PVMKU/Vpg8ayx1gvI/AAAAAAAACQ8/ixYuBp-93Y0/s1600/heracross.gif"
      ],
      // Torchic DexNr. 255
      torchic: [
        "https://media.tenor.com/images/272bd23d81e5aec8c54fb152f4876b0e/tenor.gif",
        "https://media.tenor.com/images/efaf163a382cb8514608b8e715c41e97/tenor.gif",
        "https://media.tenor.com/images/2507f9f78b2020ded18ea28c438f5e7e/tenor.gif",
        "https://media.tenor.com/images/cbaa7638c9abb97b42b7bfc8501c07ec/tenor.gif",
        "http://fanaru.com/pokemon/image/251444-pokemon-torchic.gif",
        "https://thumbs.gfycat.com/AchingSickDinosaur-max-1mb.gif"
      ],
      // Lotad DexNr. 270
      lotad: [
        "https://thumbs.gfycat.com/DeadFragrantAsiaticmouflon-small.gif",
        "https://thumbs.gfycat.com/GiddyFrightenedIchthyostega-small.gif",
        "http://media.tumblr.com/5b082a2ec64b696d773de7e1717225d9/tumblr_mvraoypK4z1rxsnrxo1_500.gif",
        "https://pa1.narvii.com/5711/251eca7cceb6303081428b544d5f0d8d63eb6381_hq.gif",
        "https://i.kym-cdn.com/photos/images/original/000/916/589/243.gif",
        "http://pa1.narvii.com/6150/6bdd1fd42b1a8748daafb0fac1eea041cd0575dd_00.gif"
      ],
      // Torchic DexNr. 387
      turtwig: [
        "http://img2.wikia.nocookie.net/__cb20110507193239/ilvg/images/4/46/Turtwig.gif",
        "https://media.tumblr.com/270b7d3228003fb3d441133d9de26185/tumblr_pgp7wmf0fy1xnfihso2_500.gif",
        "https://media.tumblr.com/221498f48b37e197a5a3cccd906c1d86/tumblr_os4d647PvT1qioqevo1_r1_400.gif",
        "https://media.tumblr.com/2d2991e333c911d49599f01dd1088432/tumblr_n4gxnbt7Bu1t1y8q5o2_400.gif",
        "https://thumbs.gfycat.com/BlaringDimwittedIrishdraughthorse-size_restricted.gif"
      ],
      // Chimchar DexNr. 390
      chimchar: [
        "https://media.tumblr.com/790caef20fb3b4f3889f6067a8779b84/tumblr_mnslli3YwD1r5fhkdo1_500.gif",
        "https://media.tumblr.com/ca6455e0106771454aab3e3e726b1510/tumblr_miukt5gyDs1r8suc9o1_r1_500.gif",
        "https://media.tumblr.com/3e5ce564bb0d722b4c7ca1ad1a035aea/tumblr_on4snfVd8d1vpbs3jo1_500.gif",
        "https://media.tumblr.com/81b4609040a0d72fb51980bb94547808/tumblr_nf4b1xPN5d1toiaw4o1_500.gif",
        "https://media.tumblr.com/0f0867346c975245f21c96b07b2ce05d/tumblr_mzb5rojhVU1rpn9eno1_500.gif",
        "https://media.tumblr.com/58388d6b3660b84f46f3779fbd394d93/tumblr_ohqfm1ZNMX1rpn9eno1_500.gif",
        "https://media.giphy.com/media/QIdK6SzFSrxq8/giphy.gif",
        "https://media.tumblr.com/73473e0174da76074e10605b8d32cf18/tumblr_mlmxrjyFad1qhd8sao1_500.gif",
        "https://media.tumblr.com/bae444dc18f0743e584bd80b6499012e/tumblr_obppi6pHeE1rd4ymxo1_500.gif",
        "http://pa1.narvii.com/5752/2012f1add65e393981f84bc8ffa22f07671c8cfe_hq.gif",
        "http://pa1.narvii.com/5907/581fb04da9acb3e5443aedcf890ed4e835580d3e_hq.gif",
        "https://media.tumblr.com/b4d5a670634c7d72a7248ddc2bc73c8c/tumblr_mh6qo03jjW1r7c13zo1_500.gif",
        "https://i.pinimg.com/originals/17/ba/e8/17bae84b77cd63fb53f9e139b09f2dcf.gif",
        "https://media.tumblr.com/tumblr_lso287JZvY1qczibyo1_500.gif",
        "http://pa1.narvii.com/5878/8aa49f1c2cbb1b7728f265e218a8ace66987c034_hq.gif",
        "https://media.tenor.com/images/8495b356feb4e0d20633eeae56b59472/tenor.gif"
      ],
      // Piplup DexNr. 393
      piplup: [
        "https://media.tumblr.com/58d48fb352adb9ffd84b831e29597906/tumblr_n2jvrdWhca1sktqoto1_500.gif",
        "http://media.tumblr.com/5004ee7331193873add2d730bc5263e8/tumblr_n476iyvwrX1s5h198o1_500.gif",
        "https://media.tumblr.com/2c338e448405318aca12dafbf3cab459/tumblr_nk39mhMP2p1u7rqwto1_500.gif",
        "https://media.tumblr.com/639314c7f9c20e8e57f8c7bdecc54895/tumblr_mqvn5dtSxI1r5fhkdo1_500.gif",
        "https://media.tumblr.com/42ada90f1383de2b8f6e51622854d6fe/tumblr_nq82gkAGWu1tj7j10o1_500.gif",
        "http://i.imgur.com/DftGsQY.gif",
        "https://media.tenor.com/images/bfb9c75681a973719adf8ab8766e47f0/tenor.gif",
        "http://media.tumblr.com/tumblr_m7213yc1C01qczibyo1_500.gif",
        "https://media.tenor.com/images/d22b6bd519cb9b327d2eb8c5f65d713c/tenor.gif",
        "http://media.tumblr.com/tumblr_m02ucoHx6K1qjza3b.gif",
        "https://media.tumblr.com/80b3a371ae1f7fe8f8b780af68a596ef/tumblr_onpwvcgsao1r9ulu7o1_500.gif",
        "https://media.tumblr.com/a887021421609e08b7ed7b2c65704495/tumblr_ncym8ljcTG1rjenv2o1_500.gif",
        "https://media.tumblr.com/254cf3ba03f2e1cb308c6f8a6d6e7787/tumblr_mrty7aoHub1s8qrigo1_500.gif",
        "https://media.tumblr.com/57653f6ce67d5f96767c6642906a5c88/tumblr_n9jwfcTV4W1r8zm42o1_500.gif",
        "https://media.giphy.com/media/IJDQ3P1oinuCI/source.gif",
        "https://media.tumblr.com/f59f09f9c81b962f85f5d7ee7c0ba269/tumblr_mm1txu8t521s5h198o1_500.gif",
        "https://media.tumblr.com/77889071c19f19dbf14ad1e0816a06c7/tumblr_mzb1okSayJ1rpn9eno1_500.gif",
        "https://media.giphy.com/media/sLNtrlujiKvC/source.gif",
        "https://media.tumblr.com/822ffd1028921998b1a984e8c6760749/tumblr_ni4yfpSKcs1rq9h94o1_500.gif",
        "https://cdn.discordapp.com/attachments/599180353441366026/625034815355355206/image1.gif",
        "https://media.tumblr.com/c7d300c8d8c66964138f7898e67c69ad/tumblr_obxdu8Nzen1rpn9eno1_400.gif",
        "https://pa1.narvii.com/6722/813befd39acd10191d1828a2036a2800029efb00_hq.gif"
      ],
      // Shinx DexNr. 403
      shinx: [
        "https://media.giphy.com/media/10CqMTjcCi0n7i/giphy.gif",
        "http://media.tumblr.com/339dfeeac691eadde6614a3bfde263ce/tumblr_mhm16ypCYk1r72ht7o1_500.gif",
        "http://media.tumblr.com/tumblr_m6oiloYnIL1rrkoj1o1_500.gif",
        "http://media.tumblr.com/aa629d0db420e7ec0fa837e9f42c398d/tumblr_ndjv9bsdex1rd4ymxo1_500.gif",
        "https://media.tumblr.com/c2cc2c0f78e69cf8ff50ff2682397898/tumblr_nfk41h6oMV1tgjlm2o1_500.gif",
        "https://media.tenor.com/images/5a110a72c1a4f8b5c99649e16448e1a3/tenor.gif",
        "https://media.giphy.com/media/4LWIfEwSX3BeM/giphy.gif",
        "https://media.tumblr.com/45701c9c46e816fb2e8f82384f15ca6c/tumblr_mlrkmmbySH1rpn9eno1_500.gif",
        "https://media.tumblr.com/76cd8b7309c1ff47d9034aed4e0052d4/tumblr_new44k0nHb1tgjlm2o1_500.gif",
        "http://media.tumblr.com/b1fd58dd3c0b108e710f74cbffd3e028/tumblr_mnaij4aIOM1rqp6teo1_500.gif",
        "http://media.tumblr.com/dcc6e386ea087180d3d220b443842e87/tumblr_nwp9ix2nTS1qdyzddo2_540.gif",
        "https://media.tumblr.com/37e759d634c2a26a1e33c85f6987d511/tumblr_ndwsolwbd61ruyj56o1_500.gif",
        "https://media.tumblr.com/tumblr_m53z92PXqT1rpn9eno1_500.gif",
        "https://media.tumblr.com/b1b5f9ed0d561cc153931aa2b992ca08/tumblr_nynufvjEwW1r8sc3ro3_500.gif",
        "http://media.tumblr.com/1d860b01b97f8587521d79e55c88cb9d/tumblr_newu4fmADn1qf8rnjo1_500.gif"
      ],
      // Pachirisu DexNr. 417
      pachirisu: [
        "http://1.media.dorkly.cvcdn.com/87/44/26a36920d400c1b0c0ddb29c3373a1eb.gif",
        "https://media.tumblr.com/acfac29dfa45dbbe04b8621cbaf58e37/tumblr_o8zhoceLES1rpn9eno1_400.gif",
        "https://media.tenor.com/images/672bebae08a4c2dbc1add064cefe42b0/tenor.gif",
        "https://media.giphy.com/media/g1EX6PH6oIRva/source.gif",
        "https://i.pinimg.com/originals/74/bf/77/74bf77aa87bd0996d1c5655287e3234e.gif",
        "https://media.tumblr.com/9b0fdb9ffd2c1726aa3427ff3c20f9ac/tumblr_n7wxmmnBg41rsrk2xo2_500.gif",
        "https://data.whicdn.com/images/181265990/original.gif",
        "https://pa1.narvii.com/6359/e85d5b3509640e73294d0e439db8bed58d955e38_hq.gif",
        "http://pa1.narvii.com/5718/945c8f89a576744373ef022ea5dfdb8221b942b9_00.gif",
        "https://pa1.narvii.com/6157/9163f2d3b4f1df4f0ae8db8ff07d264f4bab3136_hq.gif",
        "https://media.giphy.com/media/tH8zhpQ1ez3IA/giphy.gif"
      ],
      // Gible DexNr. 443
      gible: [
        "https://media.giphy.com/media/9n7lqu8rhWRu8/giphy.gif",
        "https://media.giphy.com/media/W1HnOqaGXwure/giphy.gif",
        "https://media.tumblr.com/ee8a5825d26c84fbd06e09401675fc51/tumblr_n33vb0m9l51rsrk2xo1_400.gif",
        "https://archive-media-0.nyafuu.org/vp/image/1483/40/1483402345677.gif",
        "https://pa1.narvii.com/6627/822df2c9c87ef4c2e4ab54897b3e5168fe5a22d4_hq.gif",
        "http://media.tumblr.com/46a4ef524f4284ea5a49c111eb99d8d4/tumblr_n6qnpsnzQv1rjenv2o1_500.gif",
        "https://media.tumblr.com/4943dded74d6f3c460b8af183e267773/tumblr_pdqsj2AJ7V1xx1hnao2_250.gif",
        "https://thumbs.gfycat.com/UnnaturalSparklingIlsamochadegu-size_restricted.gif"
      ],
      // Glaceon DxNr. 471
      glaceon: [
        "https://media.discordapp.net/attachments/479083635815874561/622871175827161143/bruh.gif",
        "https://media.giphy.com/media/hJ35szPqcbllK/giphy.gif",
        "https://i.gifer.com/BZCq.gif",
        "https://i.gifer.com/LpEp.gif",
        "https://i.pinimg.com/originals/e7/c5/85/e7c58536ac9c04a9754bcf8956509e7d.gif",
        "http://media.tumblr.com/7f87448901a786d6fe9662c33c4a671c/tumblr_mjzqexjeWa1s720cfo1_500.gif",
        "https://media.giphy.com/media/APhaqCNC9goRW/giphy.gif",
        "https://i.redd.it/2wk2ry3yzi531.gif"
      ],
      // Gliscor DexNr. 472
      gliscor: [
        "https://media.giphy.com/media/pKgMRyqlq65na/giphy.gif",
        "https://thumbs.gfycat.com/ConcreteUntidyImperatorangel-max-1mb.gif",
        "https://thumbs.gfycat.com/WatchfulLittleGrebe-size_restricted.gif",
        "https://archive-media-0.nyafuu.org/vp/image/1379/03/1379033395712.gif",
        "https://media.giphy.com/media/kix7tthrZuWsg/source.gif",
        "https://j.gifs.com/xGKrVB.gif"
      ],
      // Gallade DexNr. 475
      gallade: [
        "https://i.pinimg.com/originals/a6/cd/6f/a6cd6f8eef8c8f849bed4435d5bbfdd6.gif",
        "https://media.tenor.com/images/d848a333e88f3b89287658d67d21c82e/tenor.gif",
        "https://media.tenor.com/images/cdeeaafae440e35ff9449d2b8ed6bef1/tenor.gif",
        "https://media.tenor.com/images/ff85cc48f39f70dee0cd1c632867532c/tenor.gif",
        "https://thumbs.gfycat.com/PeskyEuphoricDrever-size_restricted.gif",
        "https://archive-media-0.nyafuu.org/vp/image/1422/20/1422206202594.gif",
        "https://pa1.narvii.com/6257/499cc35514c260213673de6eac8e8eabd9a25319_hq.gif",
        "https://i.pinimg.com/originals/50/5f/29/505f298a5baa69b4b587f89b7bc3bee6.gif",
        "https://cdn.discordapp.com/attachments/600426622658543616/629551398119276545/giphy_2.gif"
      ],
      // Maractus DexNr. 556
      maractus: [
        "https://media.tenor.com/images/9c483f890d5ca3714197a2fc73673de4/tenor.gif",
        "https://thumbs.gfycat.com/PerkyClutteredChuckwalla-small.gif",
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3d21a08f-a035-4696-b885-8655cebde056/dd5chod-740272eb-9302-4bb5-b7b1-cd085d40bd65.gif",
        "https://pa1.narvii.com/6028/d0938b65de4ba94a569f37bf6b484f1c5b1b63cf_hq.gif",
        "https://media.tumblr.com/tumblr_m1my8pviVZ1qeyy6oo1_r1_500.gif"
      ],
      // Reshiram DexNr. 643
      reshiram: [
        "https://thumbs.gfycat.com/IndeliblePalatableBasilisk-size_restricted.gif",
        "https://media.giphy.com/media/vnKDhfyvcMOo8/giphy.gif",
        "https://i.pinimg.com/originals/5c/79/38/5c7938caeaa94302065551a322483c95.gif",
        "https://media.tenor.com/images/221b464fe4bb6aa607099f5444e8abba/tenor.gif",
        "https://gifimage.net/wp-content/uploads/2018/04/reshiram-gif-8.gif",
        "https://media.giphy.com/media/JnbnlmEYYCQ0w/giphy.gif"
      ],
      //// Non-Pokémon gifs:
      // Dango
      dango: [
        "https://media.tumblr.com/b2ef75e4a6c6ddca39bb9de9b076070a/tumblr_n9o9izGbos1rcikyeo1_500.gif",
        "http://media.tumblr.com/tumblr_me08tqhext1qbtacbo1_500.gif",
        "http://media.tumblr.com/07923ff8b2b7952248a979c5b4750e62/tumblr_mogjxkWzLO1rv977do1_500.gif",
        "https://media.tumblr.com/761843fbb20d25b3875b0e43b2422184/tumblr_nhg5l3yAzA1tqn5v2o1_500.gif",
        "https://media.tumblr.com/4172bd3bfd6f03106588876bc3edaf57/tumblr_nrptafhpHt1tvw6hvo4_500.gif",
        "https://media.tumblr.com/153d4a07d0e256ca37c803c7c97ef5e2/tumblr_oppgx0eqsz1vgzd4so5_500.gif",
        "https://media.tumblr.com/0294cb166355ddfadf279d3b0be72821/tumblr_o1xrestimL1sl23m0o1_500.gif",
        "https://media.tumblr.com/0294cb166355ddfadf279d3b0be72821/tumblr_o1xrestimL1sl23m0o1_500.gif",
        "https://cdn.discordapp.com/attachments/614979959156375567/616708137394634759/d73jb8k-2711c667-fdd2-4291-8e87-c78e9808a6d0.gif"
      ],
      // Jojo
      jojo: [
        "https://media.tenor.com/images/91ee06114445dc4caa7f3f4512c62ff9/tenor.gif",
        "https://i.pinimg.com/originals/01/36/d1/0136d1db14a36c5c2ba83bc1b5df45c7.gif",
        "https://media.giphy.com/media/bC0caT4xYU8qQ/source.gif",
        "https://media.giphy.com/media/kiJEGxbplHfT5zkCDJ/giphy.gif",
        "https://media.tumblr.com/88d978700d977ef7de997601502f4526/tumblr_phku9yAXpm1tqvsfso1_400.gif",
        "https://thumbs.gfycat.com/ForthrightBoldDaddylonglegs-max-1mb.gif",
        "http://media.giphygifs.s3.amazonaws.com/media/IzfJSTepKi5vW/giphy.gif",
        "https://media.giphy.com/media/TyFdAtfZBODNC/giphy.gif",
        "https://media.tenor.com/images/cf028dae44f0f5b1e7763747f422bbe0/tenor.gif",
        "https://media.tenor.com/images/f1fa5d2363b34bdadbcf1e7690fed3b8/tenor.gif",
        "https://media.giphy.com/media/JPgbfbcXxDr6E/giphy.gif",
        "https://i.gifer.com/DeW7.gif",
        "https://giffiles.alphacoders.com/358/35854.gif",
        "https://i.pinimg.com/originals/77/2c/2f/772c2fdc3c92c2ea385ae670bde332e4.gif",
        "https://i.makeagif.com/media/6-28-2015/DOrFwp.gif",
        "http://1.bp.blogspot.com/-RxDLJr3oeuM/UlYlciCeMWI/AAAAAAAABmo/vi9VggbFzIc/s1600/do+do+do+do+do.gif",
        "http://0.media.dorkly.cvcdn.com/18/29/1120927389b6bb3499b9d8d477ccf089.gif",
        "https://i.kym-cdn.com/photos/images/original/001/196/367/c6c.gif"
      ],
      // Stitch
      stitch: [
        "http://media.tumblr.com/b0bca037616ce9f268458d5e1610dee0/tumblr_msnvoyvo9v1s9qf9ro1_500.gif",
        "https://thumbs.gfycat.com/CharmingDecisiveGalapagosdove-max-1mb.gif",
        "https://pa1.narvii.com/6890/235e5f7b07d195d993e90649044cd528a30ef2fcr1-500-281_hq.gif",
        "https://media.tumblr.com/07460ce49df9a1c9a7d35b978fa88670/tumblr_pl9o2yqoe61qfq1l5o3_500.gif",
        "https://media.tenor.com/images/120f3b8ef4ba0364f45a91bbb9d1fd9f/tenor.gif",
        "http://images6.fanpop.com/image/photos/33900000/lilo-and-stitch-lilo-and-stitch-33997852-500-396.gif",
        "https://i.imgur.com/LNBobNg.gif",
        "http://media.tumblr.com/1cd17fd88ed7134b0d46a23b476840da/tumblr_nmntqo3P3c1qm6oc3o2_500.gif",
        "https://media.giphy.com/media/Lg5R4NBvLbB84/giphy.gif",
        "http://0.media.dorkly.cvcdn.com/88/99/6522d67a324b0e1374e9b45e39efd3a8.gif",
        "https://data.whicdn.com/images/43352527/original.gif",
        "http://4.bp.blogspot.com/-kUE5HIefmsc/U4ODJB7WuAI/AAAAAAAAALE/nPSLpROHX34/s1600/nani.gif",
        "http://33.media.tumblr.com/44773d5f52c57601764b33fd3f8f2554/tumblr_n9ab97pqsp1tp6lx0o1_500.gif",
        "http://2.bp.blogspot.com/--ptwPAnxuyY/U4OBiiyMMVI/AAAAAAAAAKY/2c-9H--H4lQ/s1600/tumblr_n586m0dTQc1s0xjvpo1_500+(1).gif",
        "http://www.tor.com/wp-content/uploads/2014/12/lilo.gif",
        "http://1.media.dorkly.cvcdn.com/59/69/726346324b015b868c217a697acfea1b.gif",
        "http://s2.favim.com/orig/150715/disnet-disney-lilo-and-stitch-stitch-Favim.com-2962683.gif",
        "https://media.tenor.com/images/88ba7356041dab0dca94bfc77e03d7f7/tenor.gif",
        "https://data.whicdn.com/images/37872216/original.gif",
        "https://media.tenor.com/images/be28585ce334d07cad7088b42358f9a4/tenor.gif",
        "https://media.tenor.com/images/35de46b0897c3ee3ccf1c6fadcb4eed8/tenor.gif",
        "https://i.pinimg.com/originals/c2/2d/6b/c22d6bb39e927f4dfe4dfac24c3a4cec.gif",
        "https://media.tumblr.com/7f420ccacd5d01f104de1d739da9c423/tumblr_nk6epyl4g31tf0o9zo1_500.gif",
        "https://media.tenor.com/images/b846fd0799324125b8d66254499d584c/tenor.gif",
        "https://media.giphy.com/media/vz4rWqFNihWqk/giphy.gif",
        "https://media.giphy.com/media/iU8I3XPGCBnCU/source.gif",
        "https://media.tenor.com/images/fe986598cc67a9ce7ecb9da06172a104/tenor.gif",
        "http://media.tumblr.com/2007cd519ce9b09e7581e75098a1c058/tumblr_mmvukzxZr31rh58ldo1_400.gif",
        "https://media.tenor.com/images/178cd8d91483eafd98026edadcca738b/tenor.gif",
        "https://media.tenor.com/images/534b7fbb372900815007a3f11128d790/tenor.gif?itemid=11626143"
      ],
      //// Interactions and emotions
      // Hug
      hug: [
        "https://media.giphy.com/media/8tpiC1JAYVMFq/source.gif",
        "https://media.giphy.com/media/LpoYxe6nuzeus/giphy.gif",
        "https://media.giphy.com/media/qPoCDRpGkRG5a/giphy.gif",
        "https://thumbs.gfycat.com/WetBoilingIaerismetalmark-size_restricted.gif",
        "https://i.pinimg.com/originals/0f/34/78/0f3478f3c29bfc2e43f400a774766940.gif",
        "https://am23.akamaized.net/tms/cnt/uploads/2016/07/hug-team-rocket-pokemon.gif",
        "https://i.kym-cdn.com/photos/images/original/001/370/086/eba.gif",
        "https://media.tenor.com/images/ddef9605935455ab0ca5b309bcf048f9/tenor.gif",
        "https://media.tenor.com/images/7668460649c6e9d4b3bca5ea55fab97d/tenor.gif",
        "https://thumbs.gfycat.com/CleverUnfoldedEgg-size_restricted.gif",
        "https://i.makeagif.com/media/9-13-2015/q3Rq3X.gif",
        "http://media.tumblr.com/tumblr_mab1kl209a1rzsfkvo1_500.gif",
        "https://uncyclopedia.ca/w/images/thumb/6/6b/Gotta-catch-em-all.gif/300px-Gotta-catch-em-all.gif",
        "https://media.tumblr.com/a1f81311447e6c699aeea636edbe93bd/tumblr_njexevcqw21tgjlm2o1_500.gif",
        "https://media.tumblr.com/c2d1ef7a3bb26fef3161ced5285e959f/tumblr_oz5n1z0SXX1tpvtc4o2_r1_500.gif",
        "https://archive-media-0.nyafuu.org/vp/image/1405/06/1405062700437.gif",
        "https://media.tumblr.com/b10505755069fc6e3a532ef7759e937d/tumblr_ogtv5qpyd01vala9ro1_r3_500.gif",
        "https://media.tumblr.com/b94380561be418a8966f719b425fac5c/tumblr_n47wr3JRrq1rjenv2o1_500.gif",
        "https://media.tumblr.com/03965920124aab7f4bb878bd5723d045/tumblr_omx30nOAb81rsrk2xo2_500.gif",
        "https://data.whicdn.com/images/246283707/original.gif",
        "https://cdn24.picsart.com/159757429002202.gif",
        "https://i.kym-cdn.com/photos/images/newsfeed/000/664/162/36e.gif",
        "https://archive-media-0.nyafuu.org/vp/image/1467/85/1467851659473.gif",
        "https://i.kym-cdn.com/photos/images/original/000/938/171/f86.gif",
        "https://data.whicdn.com/images/67093491/original.gif",
        "https://media.tumblr.com/0a6257ad22e62e3fe2fe33380587f5c6/tumblr_ojsfaiqf2I1rsrk2xo1_500.gif",
        "https://media.tumblr.com/2fe9e27a783cf0792426c8452ed186ba/tumblr_ok3werVjwm1r8sc3ro1_500.gif",
        "https://media.tumblr.com/aa88db14c65b4c936322e394464050f5/tumblr_ottjgzEHP11v68t0mo4_r1_500.gif",
        "https://i.pinimg.com/originals/a9/c7/06/a9c70693148d2ad5083f391680b99e0f.gif",
        "https://data.whicdn.com/images/140239223/original.gif",
        "https://thumbs.gfycat.com/LegitimateCompleteIvorygull-size_restricted.gif",
        "http://33.media.tumblr.com/tumblr_llf2y4v3Wp1qhigt0o1_500.gif",
        "http://media.giphy.com/media/LWTxLvp8G6gzm/giphy.gif",
        "https://media.tenor.com/images/d5cff5ce9c815361eb680f062ae2a84d/tenor.gif",
        "https://cdn.discordapp.com/attachments/599180353441366026/625034816269582357/image4.gif",
        "https://media.tumblr.com/b6a5c4410b7ff47295afa7ac7190f52d/tumblr_mgth99gQrf1r7c13zo1_500.gif"
      ]
    };

    var gifArgumentUncased = message.content.slice(5);
    var gifArgument = gifArgumentUncased.toLowerCase();
    var gifString = `Here's your gif, <@${message.author.id}>:`;

    if (gifArgument.length < 1) {
      return message.channel.send(`> You didn't provide a gif argument, so instead here's a list of the available ones, <@${message.author.id}>:

${helpText}`);
    } else if (gifArgument == "help") {
      return message.channel.send(`> Here's a list for all arguments that can return gifs, <@${message.author.id}>:

${helpText}`);
    } else if (Object.keys(gifs).includes(gifArgument)) {
      let randomGif = gifs[gifArgument].pick();
      let totalMessage = `> ${gifString}`;
      return message.channel.send(totalMessage, {
        file: randomGif
      });
    } else {
      return message.channel.send(`> This argument has no gifs bound to it, so instead here's a list of the available arguments, <@${message.author.id}>:

${helpText}`);
    };

  } catch (e) {
    // send msg to owner
    let members = message.channel.members;
    let owner = members.find('id', client.config.ownerID);
    owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);

    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, <@${message.author.id}>, please use "${client.config.prefix}report" to report the issue.`);
  };
};

module.exports.help = {
  name: "Gif",
  description: "Responds with a random gif of the specified word.",
  usage: `gif [word]`
};
