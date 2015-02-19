function validateEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

/**
 * Original:  Brian Swalwell
 * This script and many more are available free online at
 * The JavaScript Source!! http://www.javascriptsource.com
 *
 * @param {text} field
 * @returns {String|Boolean}
 */
function validateZIP(field) {
  var valid = "0123456789-";
  var hyphencount = 0;
  if (field.length!=5 && field.length!=10) {
    return "Please enter your 5 digit or 5 digit+4 zip code.";
  }
  for (var i=0; i < field.length; i++) {
    temp = "" + field.substring(i, i+1);
    if (temp == "-") hyphencount++;
    if (valid.indexOf(temp) == "-1") {
     return "Invalid characters in your zip code.  Please try again.";
    }
    if ((hyphencount > 1) || ((field.length==10) && ""+field.charAt(5)!="-")) {
      return "The hyphen character should be used with a properly formatted 5 digit+four zip code, like '12345-6789'.   Please try again.";
    }
  }
  return true;
}