exports.run = (client, message, args) => {
  // Squirtle DexNr. 7
  var gifsSquirtle = [
    "http://media.tumblr.com/3393cf4f82933c5ca0a5e23797a006d3/tumblr_mjmpsh0S9k1r6nfvjo1_500.gif",
    "https://media.tumblr.com/4ce496c0f612e4471f9e972b1589cfc7/tumblr_mz1wc0pQqo1tp9ck7o1_500.gif",
    "http://media.tumblr.com/tumblr_m22ue3qYTj1ql5an1o1_500.gif",
    "https://media.tumblr.com/2e7480b053a88c30bc923cddb5bbaf88/tumblr_miabae0Mk51qdtuqno1_500.gif",
    "http://media.tumblr.com/1961dd95c3818deb83b5f2107dd24492/tumblr_ncy6qrNwt31rey868o1_500.gif",
    "http://media.tumblr.com/21ad8bf1c1a01298983cabb81067d75d/tumblr_mjbjjymH4W1r72ht7o1_500.gif",
    "http://media.tumblr.com/398e3aceb391ddd46145029fe40b2cb2/tumblr_na33l3bL6U1toiaw4o1_500.gif",
    "https://media.tumblr.com/8b48f1d5b2302ffd18fb14e3247c4844/tumblr_nl8n5hez6q1qfjr5zo1_500.gif",
    "https://media1.tenor.com/images/b7eedef7b73e0dac613241661df347d7/tenor.gif",
    "http://media.tumblr.com/bf9f2193d66a20a51ce5aae4c689a1c3/tumblr_n42m8gv34q1rjenv2o1_500.gif",
    "http://media.tumblr.com/c0a7aa296965de179e3a9990d4adb518/tumblr_meqj0agSkv1r26jxbo1_500.gif",
    "https://media.tumblr.com/a67db62a6c7a0c8e9ef50f04f8cde847/tumblr_npjl682uH81unqh53o4_400.gif",
    "https://giphy.com/media/uRROb0WYxnPoc/giphy.gif",
    "http://media.tumblr.com/72da3491bd99d063202d65ffe89fe1f5/tumblr_nm5j5srwGh1rey868o1_500.gif",
    "https://i.pinimg.com/originals/a2/30/20/a23020ad9d00a5ba100f2264e2e751c6.gif",
    "https://giphy.com/media/awRutawdcWLJe/giphy.gif",
    "https://giphy.com/media/uRSX5PcJcwV68/giphy.gif",
    "https://media.tumblr.com/4b864411aaf48059c06fd44513c96a47/tumblr_nsorzbuLkJ1r8sc3ro1_r1_500.gif",
    "https://giphy.com/media/7mLXZL4UlLf1K/giphy.gif",
    "https://thumbs.gfycat.com/HeavenlyBrightCollardlizard-size_restricted.gif",
    "https://ugc.reveliststatic.com/gen/full/2016/07/12/14/eq/cf/phpuk05tcs2qbwe.gif"
  ];
  // Wooper DexNr. 194
  var gifsWooper = [
    "http://i.imgur.com/VOKPenb.gif",
    "https://giphy.com/media/13ErhPzkOJoty/giphy.gif",
    "https://giphy.com/media/nhNa1pj7kYVi0/giphy.gif",
    "https://i.pinimg.com/originals/89/00/34/89003420c54d6b304be5d7ed7ebdf4c7.gif",
    "https://thumbs.gfycat.com/ForcefulDiligentHoneybee-small.gif",
    "https://i.pinimg.com/originals/c7/b2/32/c7b2320c583e6b08069465f2e3570075.gif",
    "https://media.tumblr.com/fbe3d87fdf2e9e4e24941a3b36c0781f/tumblr_ori5yo2mIj1vhvnzyo1_400.gif",
    "https://i.imgur.com/JAzs0iP.gif",
    "http://media.tumblr.com/tumblr_m9b5jpGplP1qcm0wfo1_500.gif",
    "https://giphy.com/media/10VKWqp5QHEpc4/giphy.gif",
    "https://thumbs.gfycat.com/CoordinatedDescriptiveAlabamamapturtle-small.gif",
    "https://media.tumblr.com/f8ad9d7ce9d1432b574951f7c616c368/tumblr_nxk4pjBhDg1tqptlzo1_500.gif",
    "https://media.tumblr.com/f097cb1f27e986cffca34d50dfbad8b3/tumblr_nxk4pjBhDg1tqptlzo2_500.gif",
    "https://media1.tenor.com/images/160a719e7182123c715bf63b8a4d0269/tenor.gif?itemid=7178145",
    "https://media.tumblr.com/c2c5ccd1854065134127795e6a1edaf7/tumblr_nnne81Vigx1qfjr5zo1_400.gif",
    "http://i.imgur.com/uQhro.gif",
    "https://static.fjcdn.com/gifs/An_df96da_5425362.gif",
    "http://media.tumblr.com/tumblr_ljk1xdrdjX1qfjerio1_500.gif",
    "https://sixprizes.com/wp-content/uploads/2016/06/wooper-tightrope-walk-confident-happy.gif"
  ];
  // Scizor DexNr. 212
  var gifsScizor = [
    "https://giphy.com/media/pIG4Dds2aEGIg/giphy.gif",
    "https://thumbs.gfycat.com/OpenInsignificantAxolotl-size_restricted.gif",
    "https://pa1.narvii.com/6389/bcf868b12c5fb81e958b05db599e87e7672ad452_hq.gif",
    "https://archive-media-0.nyafuu.org/vp/image/1506/24/1506243095242.gif",
    "https://giphy.com/media/LkcSpYZNgz4Zy/giphy.gif",
    "https://pa1.narvii.com/6270/edb05b52a0ce00d767909d4171036faab3619e88_hq.gif",
    "https://media.tumblr.com/82af9c0fa09e680407c6d9c656f657c8/tumblr_mg0hgvSH4M1rc2uczo8_250.gif"
  ];
  // Heracross DexNr. 214
  var gifsHeracross = [
    "http://pa1.narvii.com/5875/05d79c61831339336344c875959689dcd02e8d5a_00.gif",
    "http://pa1.narvii.com/5740/fd9f625f90a74db8bd484e88f5a5023a5f52e7e7_00.gif",
    "https://pa1.narvii.com/5807/9521fd748a9dd01d3f7444b0c6cc610ac5554cbe_hq.gif",
    "https://giphy.com/media/T726Xfs8br06Q/giphy.gif",
    "https://vignette.wikia.nocookie.net/pokemonfanon/images/0/03/Venusaur_Heracross.gif",
    "https://pa1.narvii.com/5807/94885714653e3bc09f11619a7e53e9e3a20b6051_hq.gif",
    "https://archive-media-0.nyafuu.org/vp/image/1556/68/1556685719593.gif",
    "https://2.bp.blogspot.com/-cG4FA7PVMKU/Vpg8ayx1gvI/AAAAAAAACQ8/ixYuBp-93Y0/s1600/heracross.gif"
  ];
  // Torchic DexNr. 255
  var gifsTorchic = [
    "https://media1.tenor.com/images/272bd23d81e5aec8c54fb152f4876b0e/tenor.gif",
    "https://media1.tenor.com/images/efaf163a382cb8514608b8e715c41e97/tenor.gif",
    "https://media1.tenor.com/images/2507f9f78b2020ded18ea28c438f5e7e/tenor.gif",
    "https://media1.tenor.com/images/cbaa7638c9abb97b42b7bfc8501c07ec/tenor.gif",
    "http://fanaru.com/pokemon/image/251444-pokemon-torchic.gif",
    "https://thumbs.gfycat.com/AchingSickDinosaur-max-1mb.gif"
  ];
  // Torchic DexNr. 387
  var gifsTurtwig = [
    "http://img2.wikia.nocookie.net/__cb20110507193239/ilvg/images/4/46/Turtwig.gif",
    "https://media.tumblr.com/270b7d3228003fb3d441133d9de26185/tumblr_pgp7wmf0fy1xnfihso2_500.gif",
    "https://media.tumblr.com/221498f48b37e197a5a3cccd906c1d86/tumblr_os4d647PvT1qioqevo1_r1_400.gif",
    "https://media.tumblr.com/2d2991e333c911d49599f01dd1088432/tumblr_n4gxnbt7Bu1t1y8q5o2_400.gif",
    "https://thumbs.gfycat.com/BlaringDimwittedIrishdraughthorse-size_restricted.gif"
  ];
  // Chimchar DexNr. 390
  var gifsChimchar = [
    "https://media.tumblr.com/790caef20fb3b4f3889f6067a8779b84/tumblr_mnslli3YwD1r5fhkdo1_500.gif",
    "https://media.tumblr.com/ca6455e0106771454aab3e3e726b1510/tumblr_miukt5gyDs1r8suc9o1_r1_500.gif",
    "https://media.tumblr.com/3e5ce564bb0d722b4c7ca1ad1a035aea/tumblr_on4snfVd8d1vpbs3jo1_500.gif",
    "https://media.tumblr.com/81b4609040a0d72fb51980bb94547808/tumblr_nf4b1xPN5d1toiaw4o1_500.gif",
    "https://media.tumblr.com/0f0867346c975245f21c96b07b2ce05d/tumblr_mzb5rojhVU1rpn9eno1_500.gif",
    "https://media.tumblr.com/58388d6b3660b84f46f3779fbd394d93/tumblr_ohqfm1ZNMX1rpn9eno1_500.gif",
    "https://giphy.com/media/QIdK6SzFSrxq8/giphy.gif",
    "https://media.tumblr.com/73473e0174da76074e10605b8d32cf18/tumblr_mlmxrjyFad1qhd8sao1_500.gif",
    "https://media.tumblr.com/bae444dc18f0743e584bd80b6499012e/tumblr_obppi6pHeE1rd4ymxo1_500.gif",
    "http://pa1.narvii.com/5752/2012f1add65e393981f84bc8ffa22f07671c8cfe_hq.gif",
    "http://pa1.narvii.com/5907/581fb04da9acb3e5443aedcf890ed4e835580d3e_hq.gif",
    "https://media.tumblr.com/b4d5a670634c7d72a7248ddc2bc73c8c/tumblr_mh6qo03jjW1r7c13zo1_500.gif",
    "https://i.pinimg.com/originals/17/ba/e8/17bae84b77cd63fb53f9e139b09f2dcf.gif",
    "https://media.tumblr.com/tumblr_lso287JZvY1qczibyo1_500.gif",
    "http://pa1.narvii.com/5878/8aa49f1c2cbb1b7728f265e218a8ace66987c034_hq.gif",
    "https://media1.tenor.com/images/8495b356feb4e0d20633eeae56b59472/tenor.gif"
  ];
  // Piplup DexNr. 393
  var gifsPiplup = [
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
    "https://giphy.com/media/IJDQ3P1oinuCI/source.gif",
    "https://media.tumblr.com/f59f09f9c81b962f85f5d7ee7c0ba269/tumblr_mm1txu8t521s5h198o1_500.gif",
    "https://media.tumblr.com/77889071c19f19dbf14ad1e0816a06c7/tumblr_mzb1okSayJ1rpn9eno1_500.gif",
    "https://giphy.com/media/sLNtrlujiKvC/source.gif",
    "https://media.tumblr.com/822ffd1028921998b1a984e8c6760749/tumblr_ni4yfpSKcs1rq9h94o1_500.gif"
  ];
  // Shinx DexNr. 403
  var gifsShinx = [
    "https://giphy.com/media/10CqMTjcCi0n7i/giphy.gif",
    "http://media.tumblr.com/339dfeeac691eadde6614a3bfde263ce/tumblr_mhm16ypCYk1r72ht7o1_500.gif",
    "http://media.tumblr.com/tumblr_m6oiloYnIL1rrkoj1o1_500.gif",
    "http://media.tumblr.com/aa629d0db420e7ec0fa837e9f42c398d/tumblr_ndjv9bsdex1rd4ymxo1_500.gif",
    "https://media.tumblr.com/c2cc2c0f78e69cf8ff50ff2682397898/tumblr_nfk41h6oMV1tgjlm2o1_500.gif",
    "https://media1.tenor.com/images/5a110a72c1a4f8b5c99649e16448e1a3/tenor.gif",
    "https://giphy.com/media/4LWIfEwSX3BeM/giphy.gif",
    "https://media.tumblr.com/45701c9c46e816fb2e8f82384f15ca6c/tumblr_mlrkmmbySH1rpn9eno1_500.gif",
    "https://media.tumblr.com/76cd8b7309c1ff47d9034aed4e0052d4/tumblr_new44k0nHb1tgjlm2o1_500.gif",
    "http://media.tumblr.com/b1fd58dd3c0b108e710f74cbffd3e028/tumblr_mnaij4aIOM1rqp6teo1_500.gif",
    "http://media.tumblr.com/dcc6e386ea087180d3d220b443842e87/tumblr_nwp9ix2nTS1qdyzddo2_540.gif",
    "https://media.tumblr.com/37e759d634c2a26a1e33c85f6987d511/tumblr_ndwsolwbd61ruyj56o1_500.gif",
    "https://media.tumblr.com/tumblr_m53z92PXqT1rpn9eno1_500.gif",
    "https://media.tumblr.com/b1b5f9ed0d561cc153931aa2b992ca08/tumblr_nynufvjEwW1r8sc3ro3_500.gif",
    "http://media.tumblr.com/1d860b01b97f8587521d79e55c88cb9d/tumblr_newu4fmADn1qf8rnjo1_500.gif"
  ];  
  // Pachirisu DexNr. 417
  var gifsPachirisu = [
    "http://1.media.dorkly.cvcdn.com/87/44/26a36920d400c1b0c0ddb29c3373a1eb.gif",
    "https://media.tumblr.com/acfac29dfa45dbbe04b8621cbaf58e37/tumblr_o8zhoceLES1rpn9eno1_400.gif",
    "https://media1.tenor.com/images/672bebae08a4c2dbc1add064cefe42b0/tenor.gif",
    "https://giphy.com/media/g1EX6PH6oIRva/source.gif",
    "https://i.pinimg.com/originals/74/bf/77/74bf77aa87bd0996d1c5655287e3234e.gif",
    "https://media.tumblr.com/9b0fdb9ffd2c1726aa3427ff3c20f9ac/tumblr_n7wxmmnBg41rsrk2xo2_500.gif",
    "https://data.whicdn.com/images/181265990/original.gif",
    "https://pa1.narvii.com/6359/e85d5b3509640e73294d0e439db8bed58d955e38_hq.gif",
    "http://pa1.narvii.com/5718/945c8f89a576744373ef022ea5dfdb8221b942b9_00.gif",
    "https://pa1.narvii.com/6157/9163f2d3b4f1df4f0ae8db8ff07d264f4bab3136_hq.gif",
    "https://giphy.com/media/tH8zhpQ1ez3IA/giphy.gif"
  ];
  // Gliscor DexNr. 472
  var gifsGliscor = [
    "https://giphy.com/media/pKgMRyqlq65na/giphy.gif",
    "https://thumbs.gfycat.com/ConcreteUntidyImperatorangel-max-1mb.gif",
    "https://thumbs.gfycat.com/WatchfulLittleGrebe-size_restricted.gif",
    "https://archive-media-0.nyafuu.org/vp/image/1379/03/1379033395712.gif",
    "https://giphy.com/media/kix7tthrZuWsg/source.gif",
    "https://j.gifs.com/xGKrVB.gif"
  ];
  // Reshiram DexNr. 643
  var gifsReshiram = [
    "https://thumbs.gfycat.com/IndeliblePalatableBasilisk-size_restricted.gif",
    "https://giphy.com/media/vnKDhfyvcMOo8/giphy.gif",
    "https://i.pinimg.com/originals/5c/79/38/5c7938caeaa94302065551a322483c95.gif",
    "https://media1.tenor.com/images/221b464fe4bb6aa607099f5444e8abba/tenor.gif?itemid=7399449",
    "https://gifimage.net/wp-content/uploads/2018/04/reshiram-gif-8.gif",
    "https://giphy.com/media/JnbnlmEYYCQ0w/giphy.gif"
  ];
  // Non-Pokémon gifs:
  var gifsDango = [
    "https://media.tumblr.com/b2ef75e4a6c6ddca39bb9de9b076070a/tumblr_n9o9izGbos1rcikyeo1_500.gif",
    "http://media.tumblr.com/tumblr_me08tqhext1qbtacbo1_500.gif",
    "http://media.tumblr.com/07923ff8b2b7952248a979c5b4750e62/tumblr_mogjxkWzLO1rv977do1_500.gif",
    "https://media.tumblr.com/761843fbb20d25b3875b0e43b2422184/tumblr_nhg5l3yAzA1tqn5v2o1_500.gif",
    "https://media.tumblr.com/4172bd3bfd6f03106588876bc3edaf57/tumblr_nrptafhpHt1tvw6hvo4_500.gif",
    "https://media.tumblr.com/153d4a07d0e256ca37c803c7c97ef5e2/tumblr_oppgx0eqsz1vgzd4so5_500.gif",
    "https://media.tumblr.com/0294cb166355ddfadf279d3b0be72821/tumblr_o1xrestimL1sl23m0o1_500.gif",
    "https://media.tumblr.com/0294cb166355ddfadf279d3b0be72821/tumblr_o1xrestimL1sl23m0o1_500.gif",
    "https://cdn.discordapp.com/attachments/614979959156375567/616708137394634759/d73jb8k-2711c667-fdd2-4291-8e87-c78e9808a6d0.gif"
  ];
  // Interactions and emotions
  var gifsHug = [
    "https://giphy.com/media/8tpiC1JAYVMFq/source.gif",
    "https://giphy.com/media/LpoYxe6nuzeus/giphy.gif",
    "https://giphy.com/media/qPoCDRpGkRG5a/giphy.gif",
    "https://thumbs.gfycat.com/WetBoilingIaerismetalmark-size_restricted.gif",
    "https://i.pinimg.com/originals/0f/34/78/0f3478f3c29bfc2e43f400a774766940.gif",
    "https://am23.akamaized.net/tms/cnt/uploads/2016/07/hug-team-rocket-pokemon.gif",
    "https://i.kym-cdn.com/photos/images/original/001/370/086/eba.gif",
    "https://media1.tenor.com/images/ddef9605935455ab0ca5b309bcf048f9/tenor.gif",
    "https://media1.tenor.com/images/7668460649c6e9d4b3bca5ea55fab97d/tenor.gif",
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
    "https://data.whicdn.com/images/140239223/original.gif"
  ];
  var gifArgumentUncased = message.content.slice(5);
  var gifArgument = gifArgumentUncased.toLowerCase();

  if (gifArgument.length < 1) {
    return message.channel.send(`You need to specify a word to use command, <@${message.member.user.id}>, for usable arguments, use "?gif help".`);
  } else if (gifArgument == "help") {
    return message.channel.send(`Here's a list for all arguments that can return gifs, <@${message.member.user.id}>:
-Squirtle
-Wooper
-Scizor
-Heracross
-Torchic
-Turtwig
-Chimchar
-Piplup
-Shinx
-Pachirisu
-Gliscor
-Reshiram
-Dango
-Hug`);
  } else if (gifArgument == "squirtle") {
    var gifsArray = gifsSquirtle;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "wooper") {
    var gifsArray = gifsWooper;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "scizor") {
    var gifsArray = gifsScizor;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "heracross") {
    var gifsArray = gifsHeracross;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "torchic") {
    var gifsArray = gifsTorchic;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "turtwig") {
    var gifsArray = gifsTurtwig;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "chimchar") {
    var gifsArray = gifsChimchar;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "piplup") {
    var gifsArray = gifsPiplup;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "shinx") {
    var gifsArray = gifsShinx;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "pachirisu") {
    var gifsArray = gifsPachirisu;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "gliscor") {
    var gifsArray = gifsGliscor;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "reshiram") {
    var gifsArray = gifsReshiram;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "dango") {
    var gifsArray = gifsDango;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else if (gifArgument == "hug") {
    var gifsArray = gifsHug;
    var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
    return message.channel.send(`Here's your gif, <@${message.member.user.id}>: ${randomGif}`);
  } else {
    return message.channel.send(`This argument has no gifs bound to it, <@${message.member.user.id}>, for usable arguments, use "?gif help". If you want to have gifs added to certain arguments, or have entire new arguments added you should DM ${client.config.ownerAccount}.`);
  };
};

module.exports.help = {
  name: "Gif",
  description: "Responds with a random gif of the specified word.",
  usage: `gif [word]`
};
