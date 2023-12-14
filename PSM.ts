import * as fs from "fs";
import yargs from 'yargs';


const argv = yargs.options({csvfile:{
    type: 'string',
    describe: 'set file name',
    demandOption: true,
},
})
.parseSync()

// csvファイルを読み込む、そして資料の処理
let range: number = 50;
let low: number[]=[];
let high: number[]=[];
let veryhigh: number[]=[];
let verylow: number[]=[];


const csvFilePath: string = argv.csvfile+'.csv';
const data = fs.readFileSync(csvFilePath, 'utf-8').split('\r\n')
                .map((row:string):string[]=>{
                    return row.split('\t')
                });

for (let i=0;i<(data.length-2);i++){
    high.push(Number(data[i+1][1]))
    low.push(Number(data[i+1][2]))
    veryhigh.push(Number(data[i+1][3]))
    verylow.push(Number(data[i+1][4]))
}

//回答率の計算

let maxnumber:number = Math.max(Math.max(...low),Math.max(...high),Math.max(...veryhigh),Math.max(...verylow));
let highper:number[]=[];
let lowper:number[]=[];
let veryhighper:number[]=[];
let verylowper:number[]=[];

for (let i=0;i<maxnumber/range;i++){
    highper.push((high.filter((j)=>j<=range*(i+1))).length/high.length)
    lowper.push((low.filter((j)=>j>=range*(i+1))).length/low.length)
    veryhighper.push(((veryhigh.filter((j)=>j<=range*(i+1))).length)/veryhigh.length)
    verylowper.push(((verylow.filter((j)=>j>=range*(i+1))).length)/verylow.length)
}

// 上限価格，妥協価格，理想価格，下限価格の計算

function calculate_X(x1: number,y1: number,x2: number,y2:number,x3:number,y3:number,x4:number,y4:number): number{
    return ((y3-y1)*(x1-x2)*(x3-x4)+x1*(y1-y2)*(x3-x4)-x3*(y3-y4)*(x1-x2))/((y1-y2)*(x3-x4)-(x1-x2)*(y3-y4))
}

let lowestprice: number = 0
let dreamprice: number = 0
let highestprice: number = 0
let compromiseprice:number=0

for (let i=0;i<highper.length-1;i++){
    if (verylowper[i] > highper[i] && verylowper[i+1]<highper[i+1]){
        let X:number = calculate_X((i+1)*range,100*verylowper[i],(i+2)*range,100*verylowper[i+1],(i+1)*range,100*highper[i],(i+2)*range,100*highper[i+1])
        lowestprice = Math.ceil(X)
    }
    if (verylowper[i] > veryhighper[i] && verylowper[i+1]<veryhighper[i+1]){
        let X:number = calculate_X((i+1)*range,100*verylowper[i],(i+2)*range,100*verylowper[i+1],(i+1)*range,100*veryhighper[i],(i+2)*range,100*veryhighper[i+1])
        dreamprice = Math.ceil(X)
    }
    if (lowper[i] > veryhighper[i] && lowper[i+1]<veryhighper[i+1]){
        let X:number = calculate_X((i+1)*range,100*lowper[i],(i+2)*range,100*lowper[i+1],(i+1)*range,100*veryhighper[i],(i+2)*range,100*veryhighper[i+1])
        highestprice = Math.ceil(X)
    }
    if (lowper[i] > highper[i] && lowper[i+1]<highper[i+1]){
        let X:number = calculate_X((i+1)*range,100*lowper[i],(i+2)*range,100*lowper[i+1],(i+1)*range,100*highper[i],(i+2)*range,100*highper[i+1])
        compromiseprice = Math.ceil(X)
    }
}
// Output
console.log('最高価格：',String(highestprice)+'円')
console.log('妥協価格：',String(compromiseprice)+'円')
console.log('理想価格：',String(dreamprice)+'円')
console.log('最低品質保証価格：',String(lowestprice)+'円')
