let duedate = new Date('2019-05-02T01:23:00.000Z')
let nextdate = new Date('2019-05-03T01:26:00.000Z')
let recurrance = 1

//console.log(formatDate(duedate))
console.log(getRecurrance(nextdate, recurrance))


function formatDate(date) {

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return month + "/" + day + "/" + year;
}

function getRecurrance(date, recurrance) {
    console.log('recurrance : ' + recurrance)

    let day = date.getDate();
    console.log('day : ' + day)
    let month = date.getMonth() + 1;
    console.log('month : ' + month)
    let year = date.getFullYear();
    console.log('year : ' + year)


    let final_month = "";
    let final_day = "";

    if (recurrance === 4) {
        //leave the dates alone, let the user set them manually
        final_month = month
        final_day = day
    }
    if (recurrance === 3) {
        //update to the next 2nd paycheck
        final_month = month + 1;
        final_day = 26;
    }
    if (recurrance === 2) {
        //update to the next 1st paycheck
        final_month = month + 1;
        final_day = 12;
    }
    if (recurrance === 1) {
        //update to 2 weeks from now assuming a 30 day month
        if (day + 13 > 30) {
            final_month = month + 1;
        } else {
            final_month = month;
        }
        final_day = day + 13;
    }

    return final_month + "/" + final_day + "/" + year;
}