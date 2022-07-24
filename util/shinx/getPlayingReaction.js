const playing =
    [
        ['doesn\'t feel well...', 8, 0],
        ['likes the fresh air here!', 3, 1],
        ['is so happy about seeing his friends!', 2, 1.2],
        ['seems to be singing something!', 0, 0.9],
        ['seems a bit shy with those other Shinxes. Oh boy...', 8, 0.4]
        //['']
    ];

    module.exports = (index=-1) => {
        return index!=-1 ? playing[index] : playing[Math.floor(Math.random() * (playing.length - 1)) + 1];
    };