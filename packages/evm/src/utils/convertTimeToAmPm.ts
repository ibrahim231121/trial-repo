export const  convertTimeToAmPm=(time24:string)=> {
    var ts = time24;
    var H = +ts.substr(0, 2);
    var h:any = (H % 12) || 12;
    h = (h < 10)?("0"+h):h;  // leading 0 at the left for 1 digit hours
    var ampm = H < 12 ? " AM" : " PM";
    ts = h + ts.substr(2, 3) + ampm;
    return ts;
  };