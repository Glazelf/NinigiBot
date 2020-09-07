module.exports = (oldState, newState) => {
    // Doesn't log a user specific event, instead logs the client and guild state at the different intervals.
    // Because of this it's basically useless for trying to time and log VC joins/leaves without further research (would require a listener to time anyways)
    // // log info
    // console.log(oldState);
    // console.log(newState)
};