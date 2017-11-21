exports.showHideElements = function(appName, pArr, nArr){
  let element;
  if (appName === 'PATRIC'){
      //loop through pArr and set all to display:block
    for (let i = 0; i < pArr.length; i++){
      //console.log(document.getElementsByClassName(pArr[i]));
      element = document.getElementsByClassName(pArr[i])[0];
      if (element){
        element.style.display = 'block';
      }
    }
    //loop though nArr and set all to display:none
    for (let j = 0; j < nArr.length; j++){
      document.getElementsByClassName(nArr[j])[0].style.display = 'none';
    }
  } else {
    for (let k = 0; k < pArr.length; k++){
      document.getElementsByClassName(pArr[k])[0].style.display = 'none';
    }
    //loop though nArr and set all to display:none
    for (let l = 0; l < nArr.length; l++){
      document.getElementsByClassName(nArr[l])[0].style.display = 'block';
    }
  }
};
