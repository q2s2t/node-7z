'use strict';

module.exports = function (switches) {

  if (!switches) switches = {};

  var a = [];
  // Set defalut values of boolean switches
  switches.so  = (switches.so  === true)  ? true  : false;
  switches.spl = (switches.spl === true)  ? true  : false;
  switches.ssc = (switches.ssc === false) ? false : true ;
  switches.ssw = (switches.ssw === true)  ? true  : false;
  switches.y   = (switches.y   === false) ? false : true ;

  for (var s in switches) {

    // Switches that are set or not. Just add them to the array if they are
    // present. Differ the `ssc` switch treatment to later in the function.
    if (switches[s] === true && s !== 'ssc') {
      a.push('-' + s);
    }

    // Switches with a value. Detect if the value contains a space. If it does
    // wrap the value with double quotes. Else just add the switch and its value
    // to the string. Doubles quotes are used for parsing with a RegExp later.
    if (typeof switches[s] !== 'boolean') {
      if (switches[s].indexOf(' ') === -1) {
        a.push('-' + s + switches[s]);
      } else {
        a.push('-' + s + '"' + switches[s] + '"');
      }
    }

    // Special treatment for `-ssc`
    if (s === 'ssc') {
      a.push((switches.ssc === true) ? '-ssc' : '-ssc-');
    }

  }

  return a;

};
