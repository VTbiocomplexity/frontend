// exports.showHideElements = function(appName, pArr, nArr){
//   let element;
//   for (let i = 0; i < pArr.length; i++){
//     element = document.getElementsByClassName(pArr[i])[0];
//     if (appName === 'PATRIC'){
//       element.style.display = 'block';
//     } else {
//       element.style.display = 'none';
//     }
//   }
//   for (let j = 0; j < nArr.length; j++){
//     element = document.getElementsByClassName(nArr[j])[0];
//     if (appName === 'PATRIC'){
//       element.style.display = 'none';
//     } else {
//       element.style.display = 'block';
//     }
//   }
// };

exports.showHideElements2 = function(appName, objofElements){
  let objKeys = Object.keys(objofElements);
  let element;
  for (let i = 0; i < objKeys.length; i++){
    //element = document.getElementsByClassName(pArr[i])[0];
    if ((appName === 'PATRIC' && objKeys[i] === 'PATRIC') || (appName !== 'PATRIC' && objKeys[i] !== 'PATRIC')){
      for (j = 0; j < objofElements[objKeys[i]].length; j++){
        element = objofElements[objKeys[i]][j];
        document.getElementsByClassName(element)[0].style.display = 'block';
      }
    }
    if ((appName === 'PATRIC' && objKeys[i] !== 'PATRIC') || (appName !== 'PATRIC' && objKeys[i] === 'PATRIC') ){
      for (k = 0; k < objofElements[objKeys[i]].length; k++){
        element = objofElements[objKeys[i]][k];
        document.getElementsByClassName(element)[0].style.display = 'none';
      }
    }
  }
    // if (appName !== 'PATRIC' && objKeys[i] !== 'PATRIC'){
    //   for (l = 0; l < objofElements[objKeys[i]].length; l++){
    //     element = objofElements[objKeys[i]][l];
    //     document.getElementsByClassName(element)[0].style.display = 'block';
    //   }
    // }
  //   if (appName !== 'PATRIC' && objKeys[i] === 'PATRIC'){
  //     for (m = 0; m < objofElements[objKeys[i]].length; m++){
  //       element = objofElements[objKeys[i]][m];
  //       document.getElementsByClassName(element)[0].style.display = 'none';
  //     }
  //   }
  // }
  //     element.style.display = 'block';
  // }
  // //else {
  //     element.style.display = 'none';
  //   }
  // }
  // for (let j = 0; j < nArr.length; j++){
  //   element = document.getElementsByClassName(nArr[j])[0];
  //   if (appName === 'PATRIC'){
  //     element.style.display = 'none';
  //   } else {
  //     element.style.display = 'block';
  //   }
  // }
};

exports.nevermind = function(className){
  let regform1 = document.getElementsByClassName(className);
  if (regform1[0] !== undefined) {
    regform1[0].style.display = 'none';
  }
};
