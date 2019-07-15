class CalcController{

    constructor(){

        this._lastOperator = '';
        this._lastNumber = '';

        this._audioOnOff = false;
        this._audio = new Audio('click.mp3');

        this._operation = [];
        this._locale = "pt-BR";
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        
        this._currentDate;  
        this.initialize();
        this.initButtonsEvents();
        this.initKeyBoard();
    }

    initialize(){   
        
        this.setLastNumberToDisplay();
        this.setDisplayDateTime();
        setInterval(()=>{
            this.setDisplayDateTime();
        },1000);

        document.querySelectorAll('.btn-ac').forEach(btn=>{
            btn.addEventListener('dblclick', e=>{
                this.toggleAudio();
            })
        });

        this.pasteFromClipboard();

    }

    copyToClipboard(){
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);

        input.select();
        document.execCommand("Copy");
        input.remove();
    }

    pasteFromClipboard(){
        document.addEventListener('paste', e => {
            let text = e.clipboardData.getData('Text');
            text = parseFloat(text);
            this.displayCalc = text;

            this.pushOperation(text);
        });
    }

    toggleAudio(){
        this._audioOnOff = !this._audioOnOff;
    }

    playAudio(){
        if(this._audioOnOff){
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    initKeyBoard(){

        document.addEventListener('keyup', e => {

            this.playAudio();
            switch(e.key){
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addPoint('.');
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
            }

            console.log(e.key);
        })
    }

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        this._dateEl.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){

        if(value.toString().length > 10){
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

    addEventListenerAll(element, events, fn){
        let eventList = events.split(' ');

        eventList.forEach(event => {
            element.addEventListener(event, fn, false);
        });

    }

    clearAll(){
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }

    clearEntry(){
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    setError(){
        this.displayCalc = "Error";
    }

    getLastOperation(){
        return this._operation[this._operation.length -1];
    }

    setLastOperation(value){
        this._operation[this._operation.length-1] = value;
    }

    isOperator(value){
        return(['+', '-', '/', '*', '%'].indexOf(value) > -1)
    }

    getResult(){
        try{
            return eval(this._operation.join(""));
        }catch(e){
            setTimeout(()=>{
                this.setError();    
            }, 1);
        }
        
    }

    calc(){

        let lastOP = '';

        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3){
            lastOP = this._operation.pop();

            this._lastNumber = this.getResult();
        }else if(this._operation.length == 3){
            
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();

        if(lastOP == '%'){
            result /= 100;
            this._operation = [result];
        }else{
            this._operation = [result];
            if(lastOP){
                this._operation.push(lastOP);
            }
        }

        this.setLastNumberToDisplay();
    }

    pushOperation(value){
        this._operation.push(value);

        if(this._operation.length > 3){
            this.calc();
        }
    }

    getLastItem(isOperator = true){
        let lastItem;

        for(let i = this._operation.length-1; i >= 0; i--){
            if(this.isOperator(this._operation[i]) == isOperator){
                lastItem = this._operation[i];
                break;
            }

        }

        if(!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this.lastNumber;
        }

        return lastItem;
    }

    setLastNumberToDisplay(){
        let lastNumber = this.getLastItem(false);

        if(!lastNumber){
            lastNumber = 0;
        }

        this.displayCalc = lastNumber;
    }

    addOperation(value){
        if(isNaN(this.getLastOperation())){
            //STRING
            if(this.isOperator(value)){
                //Switch operator
                this.setLastOperation(value);
            }else{
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }

        }else{
            //NUMBER

            if(this.isOperator(value)){
                this.pushOperation(value);
            }else{
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                //DISPLAY UPDATE
                this.setLastNumberToDisplay();
            }
        }
    }

    addPoint(){
        let lastOperation = this.getLastOperation();

        if(typeof lastOperation == 'string' && lastOperation.split('').indexOf('.') > -1){
            return;
        }

        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.')
        }else{
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
        console.log(lastOperation);
    }

    execBtn(value){

        this.playAudio();

        switch(value){
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addPoint('.');
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }
    }

    initButtonsEvents(){
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index)=>{
            this.addEventListenerAll(btn, 'click drag', e => {
                let textBtn = btn.className.baseVal.replace("btn-","");

                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
                btn.style.cursor = "pointer";
            });
        });
    }

    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }


}