function getExchangeDate(){

    timeText = document.getElementById('exhange-rate').innerHTML = "Exhange Rates for Thursday, February 3, 2022, EST";

        
}

const getCurrencyData = async () => {
    let currencyData = await fetch('https://www.bankofcanada.ca/valet/observations/group/FX_RATES_DAILY/xml?start_date=2017-01-03')
        .then((response) => response.text())
        .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
        .then((data) => {
            
            //console.log(data)
            latestObs = data.getElementsByTagName('o')

            latestObs = latestObs.item(latestObs.length-1).getElementsByTagName('v')

            parsedObs = parseObservation(latestObs)

            return parsedObs
        })
    return currencyData
}

function parseObservation(obs){

    convDict = []

    for(let c of latestObs){
        convDict.push({
            currAbv: c.getAttribute('s').slice(2, 5),
            currConvToCAD: Number(c.innerHTML)
        })
    }
    return convDict
}

const getCurrencySymbolData = async () => {
    let symbolData = await fetch('https://nameless-tundra-93363.herokuapp.com/https://www.xe.com/symbols.php')
        .then((response) => response.text())
        .then((str) => {
            let parser  = new DOMParser();
            let htmlDoc = parser.parseFromString(str, 'text/html')
            
            const currTable = htmlDoc.getElementsByClassName('currencySymblTable')[0];

            const currTRows = currTable.getElementsByTagName('tr')

            const currDict = parseTableCurrency(currTRows);
            currDict.shift()

            let html = "";
            const currencyList = document.getElementById('currency-buttons');

            //getCurrencyData().then((data) => console.log(data));

            currDict.forEach((curr) => {
                html+= `
                    <button class="currBtn">
                        <p>${curr.abv}</p>
                        ${curr.symb}</img>
                    </button>
                `
            })

            currencyList.innerHTML = html
            return currDict
        })
    return symbolData;
}

function parseTableCurrency(currency){

    const currDictList = []
    let count = 0

    for(let curr of currency){

        if(count !== 0){
            let test = String(curr.getElementsByTagName('td')[2].innerHTML)

            currDictList.push({
                name: curr.getElementsByTagName('td')[0].querySelector('a').innerHTML,
                abv: curr.getElementsByTagName('td')[1].innerHTML,
                symb: test.slice(0, 10) + "https://www.xe.com/" + test.slice(11)
            })
        }
        count+=1;
    }
    return currDictList
}

function checkIfFocus(){

    const elem = document.activeElement;
    console.log(elem)
}

function populateButtons(currList){

    let html = "";

    const currencyList = document.getElementById('currency-buttons');

    currList.forEach((curr) => {
        html+= `
            <button class="currBtn" id="${curr.abv}">
                <p>${curr.abv}</p>
                ${curr.symb}</img>
            </button>
        `
    });

    currencyList.innerHTML = html

}

window.onload = async () => {
    getExchangeDate();
    const currData = await getCurrencyData();
    const symbData = await getCurrencySymbolData();

    currData.splice(2, 0, {
        currAbv: 'CAD',
        currConvToCAD: 1,
    })

    let symbKeyList = []

    for(let x of currData){
        symbKeyList.push(x.currAbv)
    }

    console.log(currData)
    console.log(symbData)

    const filteredSymbData = symbData.filter((symb) => {
        if(String(symb.abv) === 'CAD'){
            return true
        }else{
            return symbKeyList.includes(String(symb.abv));
        }
    })
 
    populateButtons(filteredSymbData);

    console.log(filteredSymbData)

    const calculateBtn = document.getElementById('calculate-btn');

    const fromInput = document.getElementById("from-input");
    const toInput = document.getElementById("to-input");
    const amtInput = document.getElementById("amount-input");
    const convResult = document.getElementById('convert-result')

    let inputFocus = ""
    let fromAbv = ""
    let toAbv = ""

    const buttonList = document.querySelectorAll('.currBtn')
    buttonList.forEach((btn) => {
        btn.addEventListener('click', function(){

            let currIndex = symbKeyList.indexOf(btn.querySelector('p').innerHTML);
            inputFocus.value = filteredSymbData[currIndex].name;

            if(inputFocus === fromInput){
                fromAbv = btn.querySelector('p').innerHTML
            }else{
                toAbv = btn.querySelector('p').innerHTML
            }
        })
    })

    fromInput.addEventListener('click', function(){
        inputFocus = fromInput;
    })

    toInput.addEventListener('click', function(){
        inputFocus = toInput;
    })

    calculateBtn.addEventListener('click', function(){
        let amount = 0;
        let convAmt = 0;

        amount = Number(amtInput.value)
        
        if(fromAbv !== 'CAD' && toAbv === 'CAD'){
            convAmt = currData[symbKeyList.indexOf(fromAbv)].currConvToCAD * amount;
        }else 
        if(fromAbv === 'CAD' && toAbv !== 'CAD'){
            convAmt = (1/(currData[symbKeyList.indexOf(toAbv)].currConvToCAD)) * amount
        }else{
            convAmt = currData[symbKeyList.indexOf(fromAbv)].currConvToCAD * amount
            convAmt = (1/(currData[symbKeyList.indexOf(toAbv)].currConvToCAD)) * convAmt
        }

        convResult.innerHTML = convAmt.toFixed(2);
    })
}

//https://nameless-tundra-93363.herokuapp.com/https://www.xe.com/symbols.php