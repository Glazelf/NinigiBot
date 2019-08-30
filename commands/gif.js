exports.run = (client, message, args) => {
    var gifsDango = [
        "https://38.media.tumblr.com/b2ef75e4a6c6ddca39bb9de9b076070a/tumblr_n9o9izGbos1rcikyeo1_500.gif",
        "http://24.media.tumblr.com/tumblr_me08tqhext1qbtacbo1_500.gif",
        "http://24.media.tumblr.com/07923ff8b2b7952248a979c5b4750e62/tumblr_mogjxkWzLO1rv977do1_500.gif",
        "https://78.media.tumblr.com/761843fbb20d25b3875b0e43b2422184/tumblr_nhg5l3yAzA1tqn5v2o1_500.gif",
        "https://68.media.tumblr.com/4172bd3bfd6f03106588876bc3edaf57/tumblr_nrptafhpHt1tvw6hvo4_500.gif",
        "https://68.media.tumblr.com/153d4a07d0e256ca37c803c7c97ef5e2/tumblr_oppgx0eqsz1vgzd4so5_500.gif",
        "https://68.media.tumblr.com/0294cb166355ddfadf279d3b0be72821/tumblr_o1xrestimL1sl23m0o1_500.gif",
        "https://68.media.tumblr.com/0294cb166355ddfadf279d3b0be72821/tumblr_o1xrestimL1sl23m0o1_500.gif",
        "https://cdn.discordapp.com/attachments/614979959156375567/616708137394634759/d73jb8k-2711c667-fdd2-4291-8e87-c78e9808a6d0.gif"
      ];
      var gifsShinx = [
        "https://media.giphy.com/media/10CqMTjcCi0n7i/giphy.gif",
        "http://24.media.tumblr.com/339dfeeac691eadde6614a3bfde263ce/tumblr_mhm16ypCYk1r72ht7o1_500.gif",
        "http://31.media.tumblr.com/tumblr_m6oiloYnIL1rrkoj1o1_500.gif",
        "http://38.media.tumblr.com/aa629d0db420e7ec0fa837e9f42c398d/tumblr_ndjv9bsdex1rd4ymxo1_500.gif",
        "https://78.media.tumblr.com/c2cc2c0f78e69cf8ff50ff2682397898/tumblr_nfk41h6oMV1tgjlm2o1_500.gif",
        "https://media1.tenor.com/images/5a110a72c1a4f8b5c99649e16448e1a3/tenor.gif",
        "https://media.giphy.com/media/4LWIfEwSX3BeM/giphy.gif",
        "https://38.media.tumblr.com/45701c9c46e816fb2e8f82384f15ca6c/tumblr_mlrkmmbySH1rpn9eno1_500.gif",
        "https://49.media.tumblr.com/76cd8b7309c1ff47d9034aed4e0052d4/tumblr_new44k0nHb1tgjlm2o1_500.gif",
        "http://37.media.tumblr.com/b1fd58dd3c0b108e710f74cbffd3e028/tumblr_mnaij4aIOM1rqp6teo1_500.gif",
        "http://68.media.tumblr.com/dcc6e386ea087180d3d220b443842e87/tumblr_nwp9ix2nTS1qdyzddo2_540.gif",
        "https://33.media.tumblr.com/37e759d634c2a26a1e33c85f6987d511/tumblr_ndwsolwbd61ruyj56o1_500.gif",
        "https://38.media.tumblr.com/tumblr_m53z92PXqT1rpn9eno1_500.gif",
        "https://78.media.tumblr.com/b1b5f9ed0d561cc153931aa2b992ca08/tumblr_nynufvjEwW1r8sc3ro3_500.gif",
        "http://33.media.tumblr.com/1d860b01b97f8587521d79e55c88cb9d/tumblr_newu4fmADn1qf8rnjo1_500.gif"
      ];
      var gifsSquirtle = [
        "http://31.media.tumblr.com/3393cf4f82933c5ca0a5e23797a006d3/tumblr_mjmpsh0S9k1r6nfvjo1_500.gif",
        "https://38.media.tumblr.com/4ce496c0f612e4471f9e972b1589cfc7/tumblr_mz1wc0pQqo1tp9ck7o1_500.gif",
        "http://24.media.tumblr.com/tumblr_m22ue3qYTj1ql5an1o1_500.gif",
        "https://33.media.tumblr.com/2e7480b053a88c30bc923cddb5bbaf88/tumblr_miabae0Mk51qdtuqno1_500.gif",
        "http://33.media.tumblr.com/1961dd95c3818deb83b5f2107dd24492/tumblr_ncy6qrNwt31rey868o1_500.gif",
        "http://31.media.tumblr.com/21ad8bf1c1a01298983cabb81067d75d/tumblr_mjbjjymH4W1r72ht7o1_500.gif",
        "http://38.media.tumblr.com/398e3aceb391ddd46145029fe40b2cb2/tumblr_na33l3bL6U1toiaw4o1_500.gif",
        "https://38.media.tumblr.com/8b48f1d5b2302ffd18fb14e3247c4844/tumblr_nl8n5hez6q1qfjr5zo1_500.gif",
        "https://media1.tenor.com/images/b7eedef7b73e0dac613241661df347d7/tenor.gif",
        "http://24.media.tumblr.com/bf9f2193d66a20a51ce5aae4c689a1c3/tumblr_n42m8gv34q1rjenv2o1_500.gif",
        "http://25.media.tumblr.com/c0a7aa296965de179e3a9990d4adb518/tumblr_meqj0agSkv1r26jxbo1_500.gif",
        "https://31.media.tumblr.com/a67db62a6c7a0c8e9ef50f04f8cde847/tumblr_npjl682uH81unqh53o4_400.gif",
        "https://media.giphy.com/media/uRROb0WYxnPoc/giphy.gif",
        "http://31.media.tumblr.com/72da3491bd99d063202d65ffe89fe1f5/tumblr_nm5j5srwGh1rey868o1_500.gif",
        "https://i.pinimg.com/originals/a2/30/20/a23020ad9d00a5ba100f2264e2e751c6.gif",
        "https://media.giphy.com/media/awRutawdcWLJe/giphy.gif",
        "https://media.giphy.com/media/uRSX5PcJcwV68/giphy.gif",
        "https://78.media.tumblr.com/4b864411aaf48059c06fd44513c96a47/tumblr_nsorzbuLkJ1r8sc3ro1_r1_500.gif",
        "https://media.giphy.com/media/7mLXZL4UlLf1K/giphy.gif",
        "https://thumbs.gfycat.com/HeavenlyBrightCollardlizard-size_restricted.gif",
        "https://ugc.reveliststatic.com/gen/full/2016/07/12/14/eq/cf/phpuk05tcs2qbwe.gif"
      ]
      var gifsTurtwig = [
        "http://img2.wikia.nocookie.net/__cb20110507193239/ilvg/images/4/46/Turtwig.gif",
        "https://66.media.tumblr.com/270b7d3228003fb3d441133d9de26185/tumblr_pgp7wmf0fy1xnfihso2_500.gif",
        "https://68.media.tumblr.com/221498f48b37e197a5a3cccd906c1d86/tumblr_os4d647PvT1qioqevo1_r1_400.gif",
        "https://78.media.tumblr.com/2d2991e333c911d49599f01dd1088432/tumblr_n4gxnbt7Bu1t1y8q5o2_400.gif",
        "https://thumbs.gfycat.com/BlaringDimwittedIrishdraughthorse-size_restricted.gif"
      ]
      var gifsChimchar = [
        "https://31.media.tumblr.com/790caef20fb3b4f3889f6067a8779b84/tumblr_mnslli3YwD1r5fhkdo1_500.gif",
        "https://31.media.tumblr.com/ca6455e0106771454aab3e3e726b1510/tumblr_miukt5gyDs1r8suc9o1_r1_500.gif",
        "https://68.media.tumblr.com/3e5ce564bb0d722b4c7ca1ad1a035aea/tumblr_on4snfVd8d1vpbs3jo1_500.gif",
        "https://33.media.tumblr.com/81b4609040a0d72fb51980bb94547808/tumblr_nf4b1xPN5d1toiaw4o1_500.gif",
        "https://33.media.tumblr.com/0f0867346c975245f21c96b07b2ce05d/tumblr_mzb5rojhVU1rpn9eno1_500.gif",
        "https://66.media.tumblr.com/58388d6b3660b84f46f3779fbd394d93/tumblr_ohqfm1ZNMX1rpn9eno1_500.gif",
        "https://media.giphy.com/media/QIdK6SzFSrxq8/giphy.gif",
        "https://68.media.tumblr.com/73473e0174da76074e10605b8d32cf18/tumblr_mlmxrjyFad1qhd8sao1_500.gif",
        "https://78.media.tumblr.com/bae444dc18f0743e584bd80b6499012e/tumblr_obppi6pHeE1rd4ymxo1_500.gif",
        "http://pa1.narvii.com/5752/2012f1add65e393981f84bc8ffa22f07671c8cfe_hq.gif",
        "http://pa1.narvii.com/5907/581fb04da9acb3e5443aedcf890ed4e835580d3e_hq.gif",
        "https://66.media.tumblr.com/b4d5a670634c7d72a7248ddc2bc73c8c/tumblr_mh6qo03jjW1r7c13zo1_500.gif",
        "https://i.pinimg.com/originals/17/ba/e8/17bae84b77cd63fb53f9e139b09f2dcf.gif",
        "https://66.media.tumblr.com/tumblr_lso287JZvY1qczibyo1_500.gif",
        "http://pa1.narvii.com/5878/8aa49f1c2cbb1b7728f265e218a8ace66987c034_hq.gif"
      ];
      var gifsPiplup = [
        "https://38.media.tumblr.com/58d48fb352adb9ffd84b831e29597906/tumblr_n2jvrdWhca1sktqoto1_500.gif",
        "http://38.media.tumblr.com/5004ee7331193873add2d730bc5263e8/tumblr_n476iyvwrX1s5h198o1_500.gif",
        "https://38.media.tumblr.com/2c338e448405318aca12dafbf3cab459/tumblr_nk39mhMP2p1u7rqwto1_500.gif",
        "https://38.media.tumblr.com/639314c7f9c20e8e57f8c7bdecc54895/tumblr_mqvn5dtSxI1r5fhkdo1_500.gif",
        "https://68.media.tumblr.com/42ada90f1383de2b8f6e51622854d6fe/tumblr_nq82gkAGWu1tj7j10o1_500.gif",
        "http://i.imgur.com/DftGsQY.gif",
        "https://media.tenor.com/images/bfb9c75681a973719adf8ab8766e47f0/tenor.gif",
        "http://33.media.tumblr.com/tumblr_m7213yc1C01qczibyo1_500.gif",
        "https://media.tenor.com/images/d22b6bd519cb9b327d2eb8c5f65d713c/tenor.gif",
        "http://media.tumblr.com/tumblr_m02ucoHx6K1qjza3b.gif",
        "https://78.media.tumblr.com/80b3a371ae1f7fe8f8b780af68a596ef/tumblr_onpwvcgsao1r9ulu7o1_500.gif",
        "https://38.media.tumblr.com/a887021421609e08b7ed7b2c65704495/tumblr_ncym8ljcTG1rjenv2o1_500.gif",
        "https://78.media.tumblr.com/254cf3ba03f2e1cb308c6f8a6d6e7787/tumblr_mrty7aoHub1s8qrigo1_500.gif",
        "https://31.media.tumblr.com/57653f6ce67d5f96767c6642906a5c88/tumblr_n9jwfcTV4W1r8zm42o1_500.gif",
        "https://media3.giphy.com/media/IJDQ3P1oinuCI/source.gif",
        "https://38.media.tumblr.com/f59f09f9c81b962f85f5d7ee7c0ba269/tumblr_mm1txu8t521s5h198o1_500.gif",
        "https://38.media.tumblr.com/77889071c19f19dbf14ad1e0816a06c7/tumblr_mzb1okSayJ1rpn9eno1_500.gif",
        "https://media.giphy.com/media/sLNtrlujiKvC/source.gif",
        "https://68.media.tumblr.com/822ffd1028921998b1a984e8c6760749/tumblr_ni4yfpSKcs1rq9h94o1_500.gif"
      ];
    var gifArgumentUncased = message.content.slice(5);
    var gifArgument = gifArgumentUncased.toLowerCase();
    if (gifArgument.length < 1) {
        return message.channel.send(`You need to specify a word to use this command, <@${message.member.user.id}>, for usable arguments, use "?gif help".`);
    } else if (gifArgument == "help") {
        return message.channel.send(`Here's a list for all arguments that can return gifs, <@${message.member.user.id}>:
-Dango
-Shinx
-Squirtle
-Turtwig
-Chimchar
-Piplup`);
    } else if (gifArgument == "dango") {
        var randomGif = this.gifsDango[Math.floor(Math.random() * this.gifsDango.length)];
        return message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomGif}`);
    } else if (gifArgument == "shinx") {
        var randomGif = this.gifsShinx[Math.floor(Math.random() * this.gifsShinx.length)];
        return message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomGif}`);
    } else if (gifArgument == "squirtle") {
        var randomGif = this.gifsSquirtle[Math.floor(Math.random() * this.gifsSquirtle.length)];
        return message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomGif}`);
    } else if (gifArgument == "turtwig") {
        var randomGif = this.gifsTurtwig[Math.floor(Math.random() * this.gifsTurtwig.length)];
        return message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomGif}`);
    } else if (gifArgument == "chimchar") {
        var randomGif = this.gifsChimchar[Math.floor(Math.random() * this.gifsChimchar.length)];
        return message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomGif}`);
    } else if (gifArgument == "piplup") {
        var randomGif = this.gifsPiplup[Math.floor(Math.random() * this.gifsPiplup.length)];
        return message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomGif}`);
    } else {
        return message.channel.send(`This word has no gifs bound to it, <@${message.member.user.id}>, for usable arguments, use "?gif help", or message Glaze#6669 to request gifs being added.`);
    };
};

module.exports.help = {
    name: "Gif",
    description: "Responds with a random gif of the specified word.",
    usage: `gif [word]`
};
