document.querySelector("#subRec").disabled = true;

function previewFile(){
    const preview = document.getElementById('imgPrev');
    const file = document.querySelector('input[type=file]').files[0];
    const reader = new FileReader();

    preview.style.display = "inline";

    reader.addEventListener("load", function(){
        //convert image file to base64 string
        preview.src = reader.result;
    }, false);

    if(file){
        reader.readAsDataURL(file);
        document.querySelector("#subRec").disabled = false;
    }
}

document.querySelector("#back").addEventListener("click", function(ev)
{
    location.href = "../userDash";
})


document.querySelector("#subRec").addEventListener("click", function(ev)
{
    console.log("WORKS");
    document.getElementsByClassName('loader')[0].style.display = "inline";
     document.getElementsByClassName('loginCont')[0].style.opacity = "0.5";

})
