import React, { useState, useEffect } from 'react'
import 'regenerator-runtime/runtime' 																															// Mandatory to use async, await.
import { faTimesCircle, faCalendarAlt, faChevronCircleLeft, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

require('./css/App.scss')

function Calendar() {       
	const [aWeeks, setAweeks] = useState([])
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
	const [list, setList] = useState([])
	const [dayStartsTheWeek, setDayStartsTheWeeklist] = useState(4)
	
	useEffect(() => {
		loadMonth()
	}, [])

	useEffect(() => {
		loadMonth().then(function(data){
			list.map((week) => {   
				paintWeek(week.numWeek, week.weekYear)                     
			})			
		})
	}, [currentMonth])

	const loadMonth = async () => {
		setAweeks(await retAWeeksMonth())		
	}

	const retAWeeksMonth = async() => {																															// Returns all the weeks of the month, and all the days of every week.
		let dayNumber = 1																																							// First day of the month.
		const aWeeksMonth = []																																				// Array to store the weeks of the month.
		let vEachSevenDays = new Date(currentYear, currentMonth, dayNumber)														// Date of the first day of the current month.
		const dataWeeksOfMonth = await getDataWeeksMonth(_.cloneDeep(vEachSevenDays))									// Returns array with the numbers of all the weeks of the current month.	
		let i = 0
		while ((getOMondayWeek(vEachSevenDays) <= getOLastDayMonth(currentYear, currentMonth))) {      
			const aWeek = []			
			aWeek.push(dataWeeksOfMonth[i], dataWeeksOfMonth[i + 1])    			
			aWeeksMonth.push(retADaysOfWeek(vEachSevenDays, aWeek))
			dayNumber = dayNumber + 7 																																	
			vEachSevenDays = new Date(currentYear, currentMonth, dayNumber) 														// This var gets the value every 7 days since the 1st of every month.
			i++
		}
		return aWeeksMonth
	}

	const getOMondayWeek = (eachSevenDays) => {																											// Given a day, it returns the monday of that week.	
		if (eachSevenDays.getDay() == 0) {
			eachSevenDays.setDate((eachSevenDays.getDate() - eachSevenDays.getDay() - 6))
		} else {			
			eachSevenDays.setDate((eachSevenDays.getDate() - eachSevenDays.getDay() + 1))
		}
		return eachSevenDays
	}

	const getOLastDayMonth = (year, month) => {																											// Ret last day of the month
		return new Date(year, month + 1, 0)
	}

	const retADaysOfWeek = (current, dataWeek) => {																									// It returns data for 1 week, and all the days of given week. It's CRUCIAL to understand the difference between the attribute 'year' and 'weekYear'. For any element-day, 'year' is the number of the year that element-day belongs to, but 'weekYear' is the year associated to the week that the element-day belongs to. It's easier than it seems: In this app the weeks goes from saturday to friday, so, for instance, the day 1st of January of 2021, its FRIDAY. Obviously it belongs to 2021 BUT the week associated, it still belongs to 2020, then for this element the attributes will be: data-year="2021" data-week-year="2020". So when we click over this day to select the week, we want to select the week 53 of 2020, but also, we want to record the year of this day (2021).
		const numWeekOfYear = dataWeek[0].numWeek																	
		const week = []
		week.days = []
		week.numWeek = numWeekOfYear
		week.availability = dataWeek[0].status
		for (let i = 0; i < 7; i++) {
			week.days[i] = []
			week.days[i].push(
				current.getDate()                
			)
			current.setDate(current.getDate() + 1)
			let num
			let dayWeek
			if (i > dayStartsTheWeek) {
				num = 1
				dayWeek = dataWeek[1].numWeek
			} else {
				num = 0
				dayWeek = numWeekOfYear
			}
			week.days[i].dayWeek = dayWeek
			week.days[i].availability = dataWeek[num].status
			week.days[i].price = dataWeek[num].price   
			const vMonth = _.cloneDeep(current)
			vMonth.setDate(vMonth.getDate() - 1)
			week.days[i].month = vMonth.getMonth()					
			week.days[i].year = vMonth.getFullYear()		
			week.days[i].weekYear = retAFirstNLastDay(new Date(vMonth.getFullYear(), vMonth.getMonth(), vMonth.getDate()))[0].split('-')[2]			
		} 
		return week
	}	
	
	const getDataWeeksMonth = (v1stDayMonth) => {																										// Returns all the weeks of the month, with its number of week regarding the year, its price, and its availability. 
		const aNumWeeksMonth = retANumWeeks(v1stDayMonth)		
		const aWeeksData = []
		const data = [{ status: 'available', price: '10' }, { status: 'high-demand', price: '20' }, { status: 'reserved', price: 0 }]
		aNumWeeksMonth.forEach(function(week){
			const randomNumber = Math.floor(Math.random() * 3)
			aWeeksData.push({ status: data[randomNumber].status, price: data[randomNumber].price, numWeek: week })
		})		
		return aWeeksData																																							// In production you should fetch the data of the month passing as arguments 'aNumWeeksMonth', the id of the property and the year (this.state.currentYear). This data is random everytime you select a month so, you could have troubles for example if you select a week in January, you go to February, and when you are back to January, this week is reserved (reserved, in red, NOT selected). Obviously in production the calendar is fetched from a REST API, so you would NEVER have these problems. In fact, setting random data for testing this application CAN BE CONFUSING, but I wanted to give some randomness to every month, without any pattern.
	}

	const retANumWeeks = (v1stDayMonth) => {																												// Returns an array with the numbers of all the weeks of the month.
		const aNumWeeksMonth = []
		let firstThursday
		let vN7Days																																										// It will take first and every 7n days since the first day.
		for (let i = 0; i < 7; i++) { 
			vN7Days = new Date(v1stDayMonth.valueOf())																					
			const vNDayOfWeek = (v1stDayMonth.getDay() + 6) % 7																					// Which 'n' day of the week it is (for instance tuesday is 3).	
			vN7Days.setDate(vN7Days.getDate() - vNDayOfWeek + 3)
			firstThursday = vN7Days.valueOf()																														// The number of milliseconds between 1 January 1970 00:00:00 UTC and the given date.
			vN7Days.setMonth(0, 1)
			if (vN7Days.getDay() !== 4) {
				vN7Days.setMonth(0, 1 + ((4 - vN7Days.getDay()) + 7) % 7)																	
			}
			aNumWeeksMonth.push(1 + Math.ceil((firstThursday - vN7Days) / 604800000))
			v1stDayMonth.setDate(v1stDayMonth.getDate() + 7)
		}
		return aNumWeeksMonth
	}

	const retAFirstNLastDay = (oFirstDay) => {
		if (oFirstDay.getDay() == 0){
			oFirstDay.setDate(oFirstDay.getDate() - 1)
		} else if (oFirstDay.getDay() != 6){
			oFirstDay.setDate((getOMondayWeek(oFirstDay)).getDate() - 2)
		}
		const oLastDay = _.cloneDeep(oFirstDay)
		oLastDay.setDate(oLastDay.getDate() + 6)
		return [`${oFirstDay.getDate()}-${oFirstDay.getMonth() + 1}-${oFirstDay.getFullYear()}`, `${oLastDay.getDate()}-${oLastDay.getMonth() + 1}-${oLastDay.getFullYear()}`]
	}
	
	const retNSumWeeksSelected = () => {																														// Return total amount weeks selected.
		const list = []
		list.map((reserve, idx) => {
			list.push(Number(reserve.price))
		})
		return list.reduce((a, b) => a + b, 0)
	}

	const showMonth = (num) => {
		const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
				'July', 'August', 'September', 'October', 'November', 'December']
		return monthNames[num]     
	}
	
	const showDaysName = () => {
		return [
			['Mon', 'M'],
			['Tue', 'T'], 
			['Wed', 'W'], 
			['Thu', 'T'], 
			['Fri', 'F'], 
			['Sat', 'S'], 
			['Sun', 'S']
		]
	}

	const selectWeek = (event) => {																																	// It updates the state var 'list', adding the new week or removing if the week was already selected.																	
		const status = event.target.parentNode.getAttribute('data-status')
		if (status == 'reserved') {
				alert('This week is reserved, please choose another one')
		} else {		
			const numWeek = event.target.parentNode.getAttribute('data-week')
			const weekYear = event.target.parentNode.getAttribute('data-week-year')
			const price = event.target.parentNode.getAttribute('data-price')			
			const currentDay = 	new Date(event.target.parentNode.getAttribute('data-year'), event.target.parentNode.getAttribute('data-month'), event.target.parentNode.getAttribute('data-day'))
			const [firstDay, lastDay] = retAFirstNLastDay(currentDay)			
			paintWeek(numWeek, weekYear)
			const clonedList = _.cloneDeep(list)
			const filteredList = list.filter(week => ((week.numWeek != numWeek) && (week.numYear != firstDay.split('-')[2])))
			const found = _.isEqual(clonedList, filteredList)
			if (((_.isEmpty(list) && found == true) || found == true)) {
					const reserve = []
					reserve.numWeek = numWeek
					reserve.weekYear = weekYear
					reserve.year = firstDay.split('-')[2]
					reserve.price = price
					reserve.firstDay = firstDay
					reserve.lastDay = lastDay
					let tempList = []
					tempList = list.concat([reserve])
					sortASelectedWeeks(tempList)
					setList(tempList)
			} else {
				setList(filteredList)
			}
		}
	}

	const paintWeek = (numWeek, weekYear) => {																											// Paints all the days of the month that matches with the attributes data-week and data-week-year.
		const elements = [].slice.call(document.querySelectorAll('[data-week="' + numWeek + '"][data-week-year="' + weekYear + '"]'))
		for (let i = 0; i < elements.length; i++) {
			if (elements[i].classList.contains('selected')) {
				elements[i].classList.remove('selected')              
				if (elements[i].children[0].matches('[type="checkbox"]')) {
					elements[i].children[0].checked = false
				}
			} else {
				elements[i].classList.add('selected')
				if (elements[i].children[0].matches('[type="checkbox"]')) {
					elements[i].children[0].checked = true
				}                    
			}
		}
	}

	const sortASelectedWeeks = (data) => {
		data.sort(function (a, b) {
			return String(a.year).localeCompare(String(b.year)) || a.numWeek - b.numWeek
		})
	}
	
	const changeMonth = (newValue) => {
		if (newValue == -1) {
			setCurrentYear(currentYear - 1)
			setCurrentMonth(11)
		} else if (newValue == 12) {
			setCurrentYear(currentYear + 1)
			setCurrentMonth(0)
		} else {
			setCurrentMonth(newValue)
		}
	}

	const removeSelectedWeek = (numWeek, currentYear) => {	
		paintWeek(numWeek, currentYear)
		setList(list.filter(week => ((week.numWeek != numWeek) && (week.numYear != currentYear))))
	}

	const bookNow = () => {																																					// This method would return all the info about the booking, now it's just informative.
		if (list.length == 0) {
				alert('Select at least one week.')
		} else {
			let bookNowMessage = 'You have booked the next weeks: \n'
			let priceTotal = 0
			list.map((week, idx) => {
				bookNowMessage += `Week ${week.numWeek} from ${week.firstDay} to ${week.lastDay}\n`
				priceTotal += Number(week.price)
			})
			bookNowMessage += `Total price: ${priceTotal} €. `            
			alert(bookNowMessage)
		}
	}

	if (aWeeks.length == 0) {
		return (
		<>
			Loading
		</>
		)
	} else {
		return (
			<div id="page-calendar">
				<div className="block-left">
					<div className="week-status available">
						AVAILABLE
					</div>
					<div className="week-status reserved">
						RESERVED
					</div>
					<div className="week-status high-demand">
						HIGH DEMAND
					</div>
					<div> 
						Selected weeks:
					</div>
					<div className="reserved-weeks"> 
						{list.map((reserve, idx) => {
							return <div key={idx}>
								{`Week ${reserve.numWeek} - ${reserve.year} `}  
								<a onClick={(e) => removeSelectedWeek(reserve.numWeek, reserve.year)}>
									{<FontAwesomeIcon className={'fa-week-remove'} icon={faTimesCircle}/>}
								</a> 
								<div>
									{`${reserve.firstDay}/${reserve.lastDay}`}       
								</div>
								<div>
									{`${reserve.price} €`}														
								</div>
							</div>   
							}) 
						}
					</div>
					<div>
						PRICE: <span className="price"> {retNSumWeeksSelected()} € </span>
					</div>
				</div>
				<div className="central-block">
					<div className="month-header">
						<div>
							<a onClick={(e) => changeMonth(currentMonth - 1)}>
								<FontAwesomeIcon className={'fa-month-header'} icon={faChevronCircleLeft}/>
							</a>
						</div>
						<div className="title">
							<span>
								<FontAwesomeIcon className={'fa-month-header'} icon={faCalendarAlt}/>
							</span>
							{currentYear} {showMonth(currentMonth)}
						</div>
						<div>
							<a onClick={(e) => changeMonth(currentMonth + 1)}>
								<FontAwesomeIcon className={'fa-month-header'} icon={faChevronCircleRight}/>
							</a>
						</div>
					</div>
					<div className="header-n-days">							
						<div className="days-name">
						{	showDaysName().map((dayName, idx) => {
							return (
								<div key={idx} className="day-name">
									<div className="day-name-full">
										{dayName[0]}
									</div> 
								</div>
							)
							})
						}                             
						</div>
						<div className="days-rows"> 
							{ aWeeks.map((week, idx) => {
								return <div key={idx}>
									{ week.days.map((day, numday) => {
										return <div data-year={day.year} data-month={day.month} data-day={day[0]} data-week={day.dayWeek} data-week-year={day.weekYear} data-status={day.availability} data-price={day.price} key={numday} className={'week' + day.dayWeek + ' day day-' + day.availability}> 
											<div onClick={(e) => selectWeek(e)}>
												{day[0]}
											</div>
										</div>
										}) 
									}     
									<div className="price-week">
										<div className={'checkbox checkbox-info'} data-price={890}>
											{`${week.days[0].price} €`}      
											{` Week ${week.numWeek}`}                                       															
										</div>
									</div>
								</div>
								})
							}  
						</div>                             
						<div className="book-now">
							<a onClick={(e) => bookNow()}>
								<button className="btn btn-primary">BOOK NOW</button>
							</a>
						</div>
					</div>
				</div>
			</div>
		)   
	}
}

export default Calendar
