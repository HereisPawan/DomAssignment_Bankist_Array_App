'use strict'

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const obj = {}
const account1 = {
    owner: 'Gaurav Joshi',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2024-01-03T21:31:17.178Z',
        '2024-01-04T21:31:17.178Z',
        '2024-01-11T21:31:17.178Z',
        '2024-02-01T21:31:17.178Z',
        '2024-02-04T21:31:17.178Z',
        '2024-02-23T21:31:17.178Z',
        '2024-03-02T21:31:17.178Z',
        '2024-03-05T21:31:17.178Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
}

const account2 = {
    owner: 'Pawan Bora',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2024-01-01T21:31:17.178Z',
        '2024-01-03T21:31:17.178Z',
        '2024-01-29T21:31:17.178Z',
        '2024-02-12T21:31:17.178Z',
        '2024-02-19T21:31:17.178Z',
        '2024-03-01T21:31:17.178Z',
        '2024-03-03T21:31:17.178Z',
        '2024-03-04T21:31:17.178Z',
    ],
    currency: 'USD',
    locale: 'en-US',
}

const account3 = {
    owner: 'Teja Swaroop',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
    currency: 'USD',
}

const account4 = {
    owner: 'Amandeep Singh',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
    currency: 'USD',
}

const accounts = [account1, account2, account3, account4]

// Elements
const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan-amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

let currentAccount,
    timerActive = 0,
    timerInterval,
    clearApp,
    sorted = false

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
    ['USD', 'United States dollar'],
    ['EUR', 'Euro'],
    ['GBP', 'Pound sterling'],
])

//Create a clock timer of 2 min
let timerClock = function () {
    labelTimer.textContent = `02 : 00`
    let t = 59
    let min = 1
    timerInterval = setInterval(() => {
        labelTimer.textContent = `0${min} : ${(t + '').padStart(2, 0)}`
        t--
        if (t < 0) {
            t = 59
            --min
        }
    }, 1000)

    //To log out the account and stop the clock when reached 2 min time limit
    clearApp = setTimeout(() => {
        containerApp.style.opacity = 0
        clearInterval(timerInterval)
    }, 120000)

    timerActive = 1
}

//Calculate days
let calcDate = function (dateMov) {
    let dateN = new Date()
    //Format Date using new Date();
    // let dateOM = new Date(dateMov);
    // let date = dateOM.getDate();
    // let month = dateOM.getMonth()+1;
    // let year = dateOM.getFullYear();
    // let abd =`${date}/${month}/${year}`;
    // return calcDaysPassed(dateN,dateOM)<50 ? `${calcDaysPassed(dateN,dateOM)} days ago` : abd;

    //Format date using Intl Api
    let dateStamp = new Date(dateMov)
    const calcDaysPassed = (dateNow, dateInp) => {
        return Math.trunc((dateNow - dateInp) / (1000 * 60 * 60 * 24))
    }
    if (calcDaysPassed(dateN, dateStamp) === 0) return `Today`
    let dateIntl = new Intl.DateTimeFormat(currentAccount.locale)
    return calcDaysPassed(dateN, dateStamp) > 15
        ? dateIntl.format(dateStamp)
        : `${calcDaysPassed(dateN, dateStamp)} days ago`
}

let movements
// const withdrawals = movements.filter((x)=> Math.abs(x<0));
// console.log(withdrawals);
// const movementsDollar = movements.map(function(x){return x*1.1});
// console.log(movementsDollar);

//Create UserName and push them in their respective users object
const createUsernames = function (xyz) {
    xyz.forEach(function (value) {
        value.username = value.owner
            .toLowerCase()
            .split(' ')
            .map((value) => value.slice(0, 1))
            .join('')
    })
}

createUsernames(accounts)

//Update UI acc to user's Data
const updateData = function (account, sort = false) {
    let movements = account.movements
    const movs = sort ? movements.slice().sort((a, b) => a - b) : movements
    containerMovements.innerHTML = ``
    movs.forEach(function (movement, index) {
        const type = movement > 0 ? 'deposit' : 'withdrawal'

        //To change the currency and its number according to locale
        let options = {
            style: 'currency',
            currency: account.currency,
        }
        let conMovement = new Intl.NumberFormat(account.locale, options).format(
            movement
        )
        let abd = account.movementsDates
            ? calcDate(account.movementsDates[index])
            : ''
        const updatedHtmlString = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
            index + 1
        } ${type}</div>
      <div class="movements_date">${abd}</div>
      <div class="movements__value">${conMovement}</div>
    </div>`
        containerMovements.insertAdjacentHTML('afterbegin', updatedHtmlString)
    })
}

//Get the balance of user
const getBalance = function (account) {
    let movements = account.movements
    const balance = movements.reduce((acc, x) => acc + x).toFixed(2)
    account.balance = balance

    //To change the currency and its number according to locale
    let options = {
        style: 'currency',
        currency: account.currency,
    }
    let conBalance = new Intl.NumberFormat(account.locale, options).format(
        balance
    )
    labelBalance.textContent = conBalance
}

//Calculate Deposits , Withdrawals and Interest of user
const calcDisplaySummary = function (ccAcc) {
    let movements = ccAcc.movements
    const incomes = movements
        .filter((value) => value > 0)
        .reduce((acc, value) => acc + value)
        .toFixed(2)
    labelSumIn.textContent = `${incomes}€`

    //If withdrwals is zero then reduce method should not proceed
    const filterWith = movements.filter((value) => value < 0);
    console.log(filterWith)
    const outcomes = filterWith.length ? filterWith.reduce((acc, value) => acc + value).toFixed(2) : filterWith.length;
    labelSumOut.textContent = `${Math.abs(outcomes)}€`
    const interest = movements
        .filter((value) => value > 0)
        .map((value) => Number(((ccAcc.interestRate / 100) * value).toFixed(2)))
        .filter((value) => value > 1)
        .reduce((acc, value) => acc + value)
        .toFixed(2)
    labelSumInterest.textContent = `${interest}€`
}

///////////////////////////////////////
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

// const calcAverageHumanAge = function(ages){
// return ages.map(function(age){
//   if(age<=2){
//     return 2 * age;
//   }
//   else{
//     return 16 + age * 4;
//   }
// }).filter(function(age,i,ars){
//   return age>=18;
// }).reduce((acc,agex,i,arr)=>{
//   console.log(acc ,agex);
//   return acc+agex/arr.length});
// };

// console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));
// console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));

/* 
Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

/////////////////////////////////////////////////

//Update UI method which updates movements , balance and balance summary at once
const updateUI = function (account) {
    //Display movements
    updateData(account)

    //Display balance
    getBalance(account)

    //Display summary
    calcDisplaySummary(account)
}

//Event listener when user logs in
btnLogin.addEventListener('click', function (e) {
    //Prevent Form from submitting
    e.preventDefault()

    //Close the clock if timerActive is equal to 1;
    if (timerActive === 1) {
        timerActive = 0
        clearInterval(timerInterval)
        clearTimeout(clearApp)
    }
    timerClock()

    currentAccount = accounts.find(function (value) {
        return value.username === inputLoginUsername.value
    })
    console.log(currentAccount)
    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        //Display UI and Welcome Msg
        containerApp.style.opacity = '1'
        labelWelcome.textContent = `Welcome back, ${
            currentAccount.owner.split(' ')[0]
        }`

        // Clear the input fields
        inputLoginUsername.value = inputLoginPin.value = ''
        inputLoginPin.blur()
        updateUI(currentAccount)
        console.log(accounts.indexOf(currentAccount))

        //Print the date using intl Api (Internationalizating Dates)
        let dateNow = new Date()
        const options = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            weekday: 'long',
        }
        //Get the users locale and format time acc to it
        let currLocal = navigator.language
        let loc = currentAccount.locale ? currentAccount.locale : currLocal
        console.log(loc)
        let dateFormat = new Intl.DateTimeFormat(loc, options)
        labelDate.textContent = dateFormat.format(dateNow)
        const abc = Array.from(
            document.querySelectorAll('.movements__value'),
            (v) => v.textContent.replace('€', '')
        )
        console.log(abc)
    }
})

//Money Transfer Event Listener
btnTransfer.addEventListener('click', function (e) {
    e.preventDefault()
    //Get the values
    let toTransfer = inputTransferTo.value
    let valueTransfer = Number(inputTransferAmount.value)
    inputTransferTo.value = inputTransferAmount.value = ''

    //Add Withdrawal in array movements
    inputTransferAmount.blur()
    if (
        valueTransfer <= 0 ||
        currentAccount.balance < valueTransfer ||
        !toTransfer ||
        toTransfer === currentAccount.username
    ) {
        console.log('error')
    } else {
        currentAccount.movements.push(-valueTransfer)
        let date = new Date()
        if (currentAccount.movementsDates)
            currentAccount.movementsDates.push(date.toISOString())
        console.log(currentAccount.movements)

        //Add the tranfer amount in other users movements
        const accountToTransfer = accounts.find(function (value) {
            return value.username === toTransfer
        })
        console.log(currentAccount.balance < valueTransfer)
        accountToTransfer.movements.push(valueTransfer)
        if (accountToTransfer.movementsDates)
            accountToTransfer.movementsDates.push(date.toISOString())
        updateUI(currentAccount)
    }

    //Reset Timer
    clearInterval(timerInterval)
    clearTimeout(clearApp)
    timerClock()
})

//To close the account
btnClose.addEventListener('click', function (e) {
    e.preventDefault()
    if (
        inputCloseUsername.value === currentAccount.username &&
        Number(inputClosePin.value) === currentAccount.pin
    ) {
        accounts.splice(
            accounts.findIndex(
                (value) => value.username === currentAccount.username
            ),
            1
        )
        containerApp.style.opacity = '0'
    } else {
        alert('Wrong pin or username ')
    }
    inputCloseUsername.value = inputClosePin.value = ''
    inputClosePin.blur()
})

//To get the Loan
btnLoan.addEventListener('click', function (e) {
    e.preventDefault()
    let loanAmt = Math.floor(Number(inputLoanAmount.value))
    let maxDepositAmt = currentAccount.movements.some(
        (value) => value > 0 && loanAmt <= value / 10
    )
    if (loanAmt > 0 && maxDepositAmt) {
        setTimeout(function () {
            alert(
                'Loan has been approved and money has been deposited in account .'
            )
            currentAccount.movements.push(loanAmt)
            let date = new Date()
            //Fixed bug when no dates avalibale in account
            if(currentAccount.movementsDates) currentAccount.movementsDates.push(date.toISOString());
            updateUI(currentAccount)
        }, 5000)
    } else {
        alert(`You are not eligible for Loan`)
    }
    inputLoanAmount.value = ''
    inputLoanAmount.blur()

    //Reset Timer
    clearTimeout(clearApp)
    clearInterval(timerInterval)
    timerClock()
})

movements = [100, -100]
console.log(movements.includes(-100))

const completeBalance = accounts
    .flatMap(function (value) {
        return value.movements
    })
    .reduce((acc, value) => (acc = acc + value))
console.log(completeBalance)

//Sort the movements
btnSort.addEventListener('click', function () {
    updateData(currentAccount, !sorted)
    sorted = !sorted

    //Reset Timer
    clearTimeout(clearApp)
    clearInterval(timerInterval)
    timerClock()
})

const bankDepositSum = accounts
    .flatMap((value) => value.movements)
    .filter((value) => value > 0)
    .reduce((acc, value) => acc + value)
console.log(bankDepositSum)

const numDeposits1000 = accounts
    .flatMap((value) => value.movements)
    .reduce((acc, value) => (value > 1000 ? acc + 1 : acc + 0), 0)
console.log(numDeposits1000)

const { deposits, withdrals } = accounts
    .flatMap((value) => value.movements)
    .reduce(
        (acc, value) => {
            value > 0
                ? (acc.deposits = acc.deposits + value)
                : (acc.withdrals = acc.withdrals + value)
            return acc
        },
        { deposits: 0, withdrals: 0 }
    )
console.log(deposits, withdrals)

///////////////////////////////////////
// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK 😀
*/
const dogs = [
    { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
    { weight: 8, curFood: 200, owners: ['Matilda'] },
    { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
    { weight: 32, curFood: 340, owners: ['Michael'] },
]

dogs.forEach((value) => {
    value.rfp = Math.trunc(value.weight ** 0.75 * 28)
})
console.log(dogs)

const dogsFoodHealth = function (obj) {
    if (obj.curFood >= obj.rfp / 10 + obj.rfp) {
        console.log('Too much')
    } else if (obj.curFood <= obj.rfp - obj.rfp / 10) console.log('too little')
}
const sarahDogs = function (dogs) {
    dogs.forEach((value) => {
        if (value.owners.includes('Sarah')) dogsFoodHealth(value)
    })
}
sarahDogs(dogs)

const ownersEatTooMuch = dogs
    .filter((value) => {
        if (value.curFood >= value.rfp / 10 + value.rfp) return value
    })
    .flatMap((value) => value.owners)

const ownersEatTooLess = dogs
    .filter((value) => {
        if (value.curFood <= value.rfp - value.rfp / 10) return value
    })
    .flatMap((value) => value.owners)

console.log(ownersEatTooMuch)
console.log(ownersEatTooLess)
// Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!

const logData = function (arr, arr2) {
    let abc =
        arr2.reduce((acc, value, i, arr) => {
            return acc + `${value} ${arr[i + 1] ? 'and ' : ''}`
        }, ``) + 'eat too much!'
    let bcd =
        arr.reduce((acc, value, i, arr) => {
            return acc + `${value} ${arr[i + 1] ? 'and ' : ''}`
        }, ``) + 'eat too little!'
    return console.log(`"${bcd}" and "${abc}"`)
}

logData(ownersEatTooLess, ownersEatTooMuch)

const correctAmount = function (dogs) {
    return dogs.some((value) => {
        return value.curFood == value.rfp
    })
}
const okayAmount = function (dogs) {
    return dogs.some((value) => {
        return (
            value.curFood >= value.rfp * 0.9 && value.curFood <= value.rfp * 1.1
        )
    })
}

const okayDogs = dogs.filter((value) => {
    return value.curFood >= value.rfp * 0.9 && value.curFood <= value.rfp * 1.1
})
console.log(okayDogs)
console.log(correctAmount(dogs))
console.log(okayAmount(dogs))

const sortDogs = dogs.slice().sort((a, b) => a.rfp - b.rfp)
console.log(sortDogs)

//To change the color in every second row
labelBalance.addEventListener('click', function () {
    let rowMov = document.querySelectorAll('.movements__row')
    ;[...rowMov].forEach((row, i) => {
        if (i % 2 === 0) row.style.backgroundColor = 'green'
    })
})

//Print the Date in the Label
// let dat = new Date();
// let day = `${dat.getDate()}`.padStart(2,0);
// labelDate.textContent=`${day}/${dat.getMonth()+1}/${dat.getFullYear()}, ${dat.getHours()}: ${dat.getMinutes()}`;
