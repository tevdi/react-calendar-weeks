import React from 'react'
import 'regenerator-runtime/runtime' 																															// Mandatory to use async, await.
import { faTimesCircle, faCalendarAlt, faChevronCircleLeft, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

require('./css/App.scss')

class Calendar extends React.Component {    
	constructor(props, context) {       
		super(props)
		this.state = {
			aWeeks: [],
			currentYear: new Date().getFullYear(),
			currentMonth: new Date().getMonth(),
			list: [],
			dayStartsTheWeek: 4																																					
		}
  }

  async componentDidMount() {
		const aWeeks = await this.retAWeeksMonth()			
		this.setState({ aWeeks })
	}

	async componentDidUpdate(prevProps, prevState) {
		if (prevState.currentMonth != this.state.currentMonth) { 																						
			this.setState({ aWeeks: await this.retAWeeksMonth() })
			this.state.list.map((week) => {   
				this.paintWeek(week.numWeek, week.weekYear)                     
			})
		}
	}

	async retAWeeksMonth() {																																				// Returns all the weeks of the month, and all the days of every week.
		let dayNumber = 1																																							// First day of the month.
		const aWeeksMonth = []																																				// Array to store the weeks of the month.
		let vEachSevenDays = new Date(this.state.currentYear, this.state.currentMonth, dayNumber)			// Date of the first day of the current month.
		const dataWeeksOfMonth = await this.getDataWeeksMonth(_.cloneDeep(vEachSevenDays))						// Returns array with the numbers of all the weeks of the current month.	
		let i = 0
		while ((this.getOMondayWeek(vEachSevenDays) <= this.getOLastDayMonth(this.state.currentYear, this.state.currentMonth))) {      
			const aWeek = []			
			aWeek.push(dataWeeksOfMonth[i], dataWeeksOfMonth[i + 1])    			
			aWeeksMonth.push(this.retADaysOfWeek(vEachSevenDays, aWeek))
			dayNumber = dayNumber + 7 																																	
			vEachSevenDays = new Date(this.state.currentYear, this.state.currentMonth, dayNumber) 			// This var gets the value every 7 days since the 1st of every month.
			i++
		}
		return aWeeksMonth
	}

	getDataWeeksMonth(v1stDayMonth) {																																// Returns all the weeks of the month, with its number of week regarding the year, its price, and its availability. 
		const aNumWeeksMonth = this.retANumWeeks(v1stDayMonth)		
		const aWeeksData = []
		const data = [{ status: 'available', price: '10' }, { status: 'high-demand', price: '20' }, { status: 'reserved', price: 0 }]
		aNumWeeksMonth.forEach(function(week){
			const randomNumber = Math.floor(Math.random() * 3)
			aWeeksData.push({ status: data[randomNumber].status, price: data[randomNumber].price, numWeek: week })
		})		
		return aWeeksData																																							// In production you should fetch the data of the month passing as arguments 'aNumWeeksMonth', the id of the property and the year (this.state.currentYear). This data is random everytime you select a month so, you could have troubles for example if you select a week in January, you go to February, and when you are back to January, this week is reserved (reserved, in red, NOT selected). Obviously in production the calendar is fetched from a REST API, so you would NEVER have these problems. In fact, setting random data for testing this application CAN BE CONFUSING, but I wanted to give some randomness to every month, without any pattern.
	}

	retANumWeeks(v1stDayMonth) {																																		// Returns an array with the numbers of all the weeks of the month.
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

	getOMondayWeek(eachSevenDays) {																																	// Given a day, it returns the monday of that week.	
		if (eachSevenDays.getDay() == 0) {
			eachSevenDays.setDate((eachSevenDays.getDate() - eachSevenDays.getDay() - 6))
		} else {			
			eachSevenDays.setDate((eachSevenDays.getDate() - eachSevenDays.getDay() + 1))
		}
		return eachSevenDays
	}
	
	getOLastDayMonth(year, month) {																																	// Ret last day of the month
		return new Date(year, month + 1, 0)
	}

	retADaysOfWeek(current, dataWeek) {																															// It returns data for 1 week, and all the days of given week. It's CRUCIAL to understand the difference between the attribute 'year' and 'weekYear'. For any element-day, 'year' is the number of the year that element-day belongs to, but 'weekYear' is the year associated to the week that the element-day belongs to. It's easier than it seems: In this app the weeks goes from saturday to friday, so, for instance, the day 1st of January of 2021, its FRIDAY. Obviously it belongs to 2021 BUT the week associated, it still belongs to 2020, then for this element the attributes will be: data-year="2021" data-week-year="2020". So when we click over this day to select the week, we want to select the week 53 of 2020, but also, we want to record the year of this day (2021).
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
			let num;
			let dayWeek;
			if (i > this.state.dayStartsTheWeek) {
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
			week.days[i].weekYear = this.retAFirstNLastDay(new Date(vMonth.getFullYear(), vMonth.getMonth(), vMonth.getDate()))[0].split('-')[2]			
		} 
		return week
	}	

	retNSumWeeksSelected() {																																					// Return total amount weeks selected.
		const list = []
		this.state.list.map((reserve, idx) => {
			list.push(Number(reserve.price))
		})
		return list.reduce((a, b) => a + b, 0)
	}

	showDaysName() {
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

	sortASelectedWeeks(data){
		data.sort(function (a, b) {
			return String(a.year).localeCompare(String(b.year)) || a.numWeek - b.numWeek
		})
	}

	selectWeek(event) {																																							// It updates the state var 'list', adding the new week or removing if the week was already selected.																	
		const status = event.target.parentNode.getAttribute('data-status')
		if (status == 'reserved') {
				alert('This week is reserved, please choose another one')
		} else {		
			const numWeek = event.target.parentNode.getAttribute('data-week')
			const weekYear = event.target.parentNode.getAttribute('data-week-year')
			const price = event.target.parentNode.getAttribute('data-price')			
			const currentDay = 	new Date(event.target.parentNode.getAttribute('data-year'), event.target.parentNode.getAttribute('data-month'), event.target.parentNode.getAttribute('data-day'))
			const [firstDay, lastDay] = this.retAFirstNLastDay(currentDay)			
			this.paintWeek(numWeek, weekYear)
			const clonedList = _.cloneDeep(this.state.list)
			const filteredList = this.state.list.filter(week => ((week.numWeek != numWeek) && (week.numYear != firstDay.split('-')[2])))
			const found = _.isEqual(clonedList, filteredList)
			if (((_.isEmpty(this.state.list) && found == true) || found == true)) {
				this.setState(state => {
					const reserve = []
					reserve.numWeek = numWeek
					reserve.weekYear = weekYear
					reserve.year = firstDay.split('-')[2]
					reserve.price = price
					reserve.firstDay = firstDay
					reserve.lastDay = lastDay
					let list = []
					list = state.list.concat([reserve])
					this.sortASelectedWeeks(list)				
					return {
						list
					}
				})       
			} else {
				this.setState({
					list: filteredList
				})
			}
		}
	}

	removeSelectedWeek(numWeek, currentYear) {	
		this.paintWeek(numWeek, currentYear)
		this.setState({
			list: this.state.list.filter(week => ((week.numWeek != numWeek) && (week.numYear != currentYear)))
		})
	}

	retAFirstNLastDay(oFirstDay) {
		if (oFirstDay.getDay() == 0){
			oFirstDay.setDate(oFirstDay.getDate() - 1)
		} else if (oFirstDay.getDay() != 6){
			oFirstDay.setDate((this.getOMondayWeek(oFirstDay)).getDate() - 2)
		}
		const oLastDay = _.cloneDeep(oFirstDay)
		oLastDay.setDate(oLastDay.getDate() + 6)
		return [`${oFirstDay.getDate()}-${oFirstDay.getMonth() + 1}-${oFirstDay.getFullYear()}`, `${oLastDay.getDate()}-${oLastDay.getMonth() + 1}-${oLastDay.getFullYear()}`]
	}   	

	paintWeek(numWeek, weekYear) {																																	// Paints all the days of the month that matches with the attributes data-week and data-week-year.
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

	changeMonth(newValue) {
		if (newValue == -1) {
			this.setState({ currentYear: this.state.currentYear - 1 })
			this.setState({ currentMonth: 11 })
		} else if (newValue == 12) {
			this.setState({ currentYear: this.state.currentYear + 1 })
			this.setState({ currentMonth: 0 })
		} else {
			this.setState({ currentMonth: newValue })
		}
	}

	bookNow() {																																											// This method would return all the info about the booking, now it's just informative.
		if (this.state.list.length == 0) {
				alert('Select at least one week.')
		} else {
			let bookNowMessage = 'You have booked the next weeks: \n'
			let priceTotal = 0
			this.state.list.map((week, idx) => {
				bookNowMessage += `Week ${week.numWeek} from ${week.firstDay} to ${week.lastDay}\n`
				priceTotal += Number(week.price)
			})
			bookNowMessage += `Total price: ${priceTotal} €. `            
			alert(bookNowMessage)
		}
	}

	showMonth(num) {
		const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
				'July', 'August', 'September', 'October', 'November', 'December']
		return monthNames[num]     
	}
	
	render() {
		if (this.state.aWeeks.length == 0) {
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
							{this.state.list.map((reserve, idx) => {
								return <div key={idx}>
									{`Week ${reserve.numWeek} - ${reserve.year} `}  
									<a onClick={(e) => this.removeSelectedWeek(reserve.numWeek, reserve.year)}>
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
							PRICE: <span className="price"> {this.retNSumWeeksSelected()} € </span>
						</div>
					</div>
					<div className="central-block">
						<div className="month-header">
							<div>
								<a onClick={(e) => this.changeMonth(this.state.currentMonth - 1)}>
									<FontAwesomeIcon className={'fa-month-header'} icon={faChevronCircleLeft}/>
								</a>
							</div>
							<div className="title">
								<span>
									<FontAwesomeIcon className={'fa-month-header'} icon={faCalendarAlt}/>
								</span>
								{this.state.currentYear} {this.showMonth(this.state.currentMonth)}
							</div>
							<div>
								<a onClick={(e) => this.changeMonth(this.state.currentMonth + 1)}>
									<FontAwesomeIcon className={'fa-month-header'} icon={faChevronCircleRight}/>
								</a>
							</div>
						</div>
						<div className="header-n-days">							
							<div className="days-name">
							{	this.showDaysName().map((dayName, idx) => {
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
								{ this.state.aWeeks.map((week, idx) => {
									return <div key={idx}>
										{ week.days.map((day, numday) => {
											return <div data-year={day.year} data-month={day.month} data-day={day[0]} data-week={day.dayWeek} data-week-year={day.weekYear} data-status={day.availability} data-price={day.price} key={numday} className={'week' + day.dayWeek + ' day day-' + day.availability}> 
												<div onClick={(e) => this.selectWeek(e)}>
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
								<a onClick={(e) => this.bookNow()}>
									<button className="btn btn-primary">BOOK NOW</button>
								</a>
							</div>
						</div>
					</div>
				</div>
			)   
		}
	}
}

export default Calendar
