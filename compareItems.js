const ElancoProducts =[
"Atopica","cyclosporine capsules",
"Bronchi-Shield Oral",
"Clomicalm","clomipramine hydrochloride",
"Comfortis","spinosad",
"Credelio","lotilaner",
"Deramaxx","deracoxib",
"Duramune",
"Duramune Lyme",
"Entyce","capromorelin oral solution",
"Galliprant","grapiprant tablets",
"Interceptor","milbemycin oxime",
"Interceptor Plus","milbemycin oxime/praziquantel",
"Nocita","bupivacaine liposome injectable suspension",
"Onsior","robenacoxib",
"Onsior","robenacoxib injection",
"Percorten-V","desoxycorticosterone pivalate injectable suspension",
"Rabvac",
"Surolan","miconazole nitrate, polymyxin B sulfate, prednisolone acetate",
"Tanovea-ca1","rabacfosadine for injection",
"Trifexis","spinosad + milbemycin oxime",
"Ultra Duramune",
"Verspon Absorbable Hemostatic Gelatin Sponge",
"Zobuxa","enrofloxacin",
"Atopica for Cats","cyclosporine oral solution USP Modified",
"Cheristin for cats spinetoram",
"Comfortis","spinosad",
"Fel-O-Guard",
"Fel-O-Vax",
"Interceptor","milbemycin oxime",
"Itrafungol","itraconazole oral solution",
"MilbeMite OTIC Solution","0.1% milbemycin oxime",
"Nocita","bupivacaine liposome injectable suspension",
"Onsior","robenacoxib",
"Onsior","robenacoxib injection",
"Rabvac",
"Ultra Fel-O-Vax",
"Ultra Hybrid",
"UltraNasal",
"Verspon Absorbable Hemostatic Gelatin Sponge",
"Zobuxa","enrofloxacin"]

function compareItems(items){

    for(let i = 0; i < ElancoProducts.length; i++){
        for(let j = 0; j < items.length; j++){
            if(items[j].contains(ElancoProducts[i])){
                return true;
                //this is where we would return pos and item.
            }
        }
    }

    return false;
  
}