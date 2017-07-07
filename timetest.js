let time = ""

let date = new Date()
let year = date.getFullYear().toString() 
  let month = addZerosForTime((date.getMonth() + 1).toString())
  let day = addZerosForTime(date.getDate().toString() )
  let hour = addZerosForTime(date.getUTCHours().toString())
  let minute = addZerosForTime(date.getUTCMinutes().toString())

  time = `${year}${month}${day} ${hour}:${minute}`




function addZerosForTime(string) {
  while (string.length < 2) {
    string = "0" + string
  }
  return string
}
console.log(time)