// src/components/ConferenceForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation' // Removed usePathname
import countryData from '../addconference/countries.json'
import { useTranslations } from 'next-intl'
import {
  LocationInput,
  ImportantDateInput,
  City,
  State,
  Country,
  ConferenceFormData
} from '@/src/models/send/addConference.send' //  paths might need adjusting
import { appConfig } from '@/src/middleware'

const API_BASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`
const API_ADD_CONFERENCE_ENDPOINT = `${API_BASE_URL}/user/add-conference`
const API_UPDATE_CONFERENCE_ENDPOINT = `${API_BASE_URL}/conferences` // No [id] here
const CSC_API_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY

interface ConferenceFormProps {
  locale: string
  conferenceId?: string //  ID is now optional
}
const ConferenceForm: React.FC<ConferenceFormProps> = ({
  locale,
  conferenceId
}) => {
  const t = useTranslations('')
  const router = useRouter()
  const pathname = usePathname()

  const [currentStep, setCurrentStep] = useState(1)
  const [title, setTitle] = useState('')
  const [acronym, setAcronym] = useState('')
  const [link, setLink] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [type, setType] = useState<'offline' | 'online' | 'hybrid'>('offline')
  const [location, setLocation] = useState<LocationInput>({
    address: '',
    cityStateProvince: '',
    country: '',
    continent: ''
  })
  const [dates, setDates] = useState<ImportantDateInput[]>([
    {
      type: 'conferenceDates',
      name: 'Conference Date',
      fromDate: '',
      toDate: ''
    }
  ])
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state
  const [userId, setUserId] = useState<string>('')

  // --- Location States ---
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedContinent, setSelectedContinent] = useState<string>('')
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])

  // --- Loading States ---
  const [isFetchingLocations, setIsFetchingLocations] = useState(false)
  const [initialCityStateProvinceValue, setInitialCityStateProvinceValue] =
    useState<string | null>(null)
  const [initialLocationSet, setInitialLocationSet] = useState(false)

  const continentOptions = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania']
  const dateTypeOptions = [
    { value: 'submissionDate', name: 'Submission Date' },
    { value: 'conferenceDates', name: 'Conference Dates' },
    { value: 'registrationDate', name: 'Registration Date' },
    { value: 'notificationDate', name: 'Notification Date' },
    { value: 'cameraReadyDate', name: 'Camera Ready Date' }
  ]

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      console.log('User ID from localStorage:', user.id) // Add this line

      setUserId(user.id)
    }
  }, [])

  // --- Data Fetching (for editing) ---
  useEffect(() => {
    const fetchData = async () => {
      if (!conferenceId || !userId) return
      setLoading(true)
      setError(null)
      setInitialCityStateProvinceValue(null) // Reset giá trị cũ
      try {
        const res = await fetch(`${API_BASE_URL}/user/${userId}/my-conferences`)
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`)
        }
        const data = await res.json()
        const fetchedConferences = data.find(
          (c: any) => c.conference.id === conferenceId
        )
        //  Populate form fields
        setTitle(fetchedConferences.conference.title || '')
        setAcronym(fetchedConferences.conference.acronym || '')
        setLink(fetchedConferences.organization.link || '') // Assuming 'websiteUrl' is the field
        setTopics(fetchedConferences.organization.topics || []) // Assuming you store topics
        setType(fetchedConferences.organization.accessType || 'offline') //  Default to offline
        setDescription(fetchedConferences.organization.summerize || '')
        setImageUrl(fetchedConferences.imageUrl || '')

        // Set location fetchedConferences, handle the case where it is string
        if (fetchedConferences.location) {
          if (typeof fetchedConferences.location === 'string') {
            const locationParts = fetchedConferences.location.split(', ')
            if (locationParts.length >= 2) {
              setLocation({
                address: '', // You may not have a separate address in string form
                cityStateProvince: locationParts[0],
                country: locationParts[1],
                continent: fetchedConferences.continent || '' // Add continent if available
              })
              setSelectedContinent(fetchedConferences.continent)
              setInitialCityStateProvinceValue(locationParts[0] || null)
              const country = countryData.find(
                (c: any) => c.name === locationParts[1]
              )
              if (country) {
                setSelectedCountry(country.iso2) // Trigger useEffect fetch states/cities
              } else {
                setSelectedCountry('')
                setInitialCityStateProvinceValue(null) // Reset nếu country không hợp lệ
              }
            }
          } else {
            setLocation({
              address: fetchedConferences.location.address || '',
              cityStateProvince:
                fetchedConferences.location.cityStateProvince || '',
              country: fetchedConferences.location.country || '',
              continent: fetchedConferences.location.continent || ''
            })
            setSelectedContinent(fetchedConferences.location.continent || '')
            const country = countryData.find(
              (c: any) => c.name === fetchedConferences.location.country
            )
            setInitialCityStateProvinceValue(
              fetchedConferences.location.cityStateProvince || null
            )
            if (country) {
              setSelectedCountry(country.iso2) // Trigger useEffect fetch states/cities
            } else {
              setSelectedCountry('')
              setInitialCityStateProvinceValue(null) // Reset nếu country không hợp lệ
            }
          }
        } else {
          setInitialCityStateProvinceValue(null)
        }

        // Set dates
        if (
          fetchedConferences.dates &&
          Array.isArray(fetchedConferences.dates)
        ) {
          const fetchedDates = fetchedConferences.dates.map((d: any) => ({
            type: d.type || '',
            name: d.name || '',
            fromDate: d.fromDate
              ? new Date(d.fromDate).toISOString().split('T')[0]
              : '',
            toDate: d.toDate
              ? new Date(d.toDate).toISOString().split('T')[0]
              : ''
          }))

          // Ensure at least one date entry exists
          if (fetchedDates.length === 0) {
            setDates([
              {
                type: 'conferenceDates',
                name: 'Conference Date',
                fromDate: '',
                toDate: ''
              }
            ])
          } else {
            setDates(fetchedDates)
          }
        } else {
          // Default date if none are fetched
          setDates([
            {
              type: 'conferenceDates',
              name: 'Conference Date',
              fromDate: '',
              toDate: ''
            }
          ])
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId, conferenceId]) //  Re-fetch if conferenceId changes

  useEffect(() => {
    const mappedCountries: Country[] = countryData.map((c: any) => ({
      name: c.name,
      iso2: c.iso2,
      region: c.region
    }))
    setCountries(mappedCountries)
  }, [])

  useEffect(() => {
    if (selectedContinent) {
      setStates([])
      setCities([])
      setSelectedState('')
      setSelectedCity('')
      const newFilteredCountries = countries.filter(
        country => country.region === selectedContinent
      )
      setFilteredCountries(newFilteredCountries)
      if (
        initialLocationSet &&
        selectedCountry &&
        !newFilteredCountries.some(c => c.iso2 === selectedCountry)
      ) {
        setSelectedCountry('')
      }
      setLocation({
        ...location,
        country:
          newFilteredCountries.find(c => c.iso2 === selectedCountry)?.name ||
          '',
        cityStateProvince: '',
        continent: selectedContinent
      })
    } else {
      setFilteredCountries([])
    }
    if (!selectedContinent && initialLocationSet) {
      setStates([])
      setCities([])
      setSelectedCountry('')
      setSelectedState('')
      setSelectedCity('')
      setLocation({
        ...location,
        country: '',
        cityStateProvince: '',
        continent: selectedContinent
      })
    }
  }, [selectedContinent, countries, initialLocationSet, selectedCountry])

  useEffect(() => {
    const fetchStatesOrCities = async () => {
      if (initialLocationSet) {
        setStates([])
        setCities([])
        setSelectedState('')
        setSelectedCity('')
        setLocation(prev => ({ ...prev, cityStateProvince: '' }))
      }
      if (!selectedCountry) {
        setIsFetchingLocations(false)
        setStates([])
        setCities([])
        // Nếu country bị xóa (không phải lần load đầu), đánh dấu là đã xử lý xong
        if (initialLocationSet) {
          console.log('eff5: Country cleared, marking initial location set')
          // Không cần set lại setInitialLocationSet(true) vì nó đã là true
        }
        return
      }
      setIsFetchingLocations(true)
      try {
        const statesResponse = await fetch(
          `https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`,
          {
            headers: {
              'X-CSCAPI-KEY': CSC_API_KEY || ''
            }
          }
        )

        if (!statesResponse.ok) {
          throw new Error(`State API Error: ${statesResponse.status}`)
        }

        const statesData = await statesResponse.json()
        if (statesData.length > 0) {
          const mappedStates = statesData
            .map((s: any) => ({
              name: s.name,
              iso2: s.iso2,
              country_code: s.country_code,
              state_code: s.state_code
            }))
            .sort((a: { name: string }, b: { name: any }) =>
              a.name.localeCompare(b.name)
            )
          setStates(mappedStates)
          setCities([])
        } else {
          setStates([])
          const citiesResponse = await fetch(
            `https://api.countrystatecity.in/v1/countries/${selectedCountry}/cities`,
            {
              headers: {
                'X-CSCAPI-KEY': CSC_API_KEY || ''
              }
            }
          )

          if (!citiesResponse.ok) {
            throw new Error(`City API Error: ${citiesResponse.status}`)
          }

          const citiesData = await citiesResponse.json()
          const mappedCities = citiesData.map((c: any) => ({
            name: c.name,
            country_code: c.country_code,
            state_code: c.state_code,
            latitude: c.latitude,
            longitude: c.longitude
          }))
          const uniqueCities = Array.from(
            new Set(mappedCities.map((city: { name: any }) => city.name))
          )
            .map(name => {
              return mappedCities.find(
                (city: { name: unknown }) => city.name === name
              )
            })
            .sort((a: { name: string }, b: { name: any }) =>
              a.name.localeCompare(b.name)
            )
          setCities(uniqueCities as City[])
        }
      } catch (error) {
        console.error('Error fetching states or cities:', error)
        setStates([])
        setCities([])
      } finally {
        setIsFetchingLocations(false)
      }
    }
    fetchStatesOrCities()
  }, [selectedCountry, initialLocationSet])

  useEffect(() => {
    // Chỉ chạy khi có giá trị ban đầu, có states/cities VÀ chưa xử lý lần đầu
    if (
      initialCityStateProvinceValue &&
      (states.length > 0 || cities.length > 0)
    ) {
      let found = false // Cờ kiểm tra xem đã tìm thấy và set hay chưa

      if (states.length > 0) {
        const foundState = states.find(
          s => s.name === initialCityStateProvinceValue
        )
        if (foundState) {
          setSelectedState(foundState.iso2)
          setLocation(prev => ({ ...prev, cityStateProvince: foundState.name }))
          found = true
        } else {
          console.warn(
            'Initial state not found in states list:',
            initialCityStateProvinceValue
          )
        }
      }

      // Chỉ tìm city nếu không tìm thấy state hoặc không có state nào
      if (!found && cities.length > 0) {
        const foundCity = cities.find(
          c => c.name === initialCityStateProvinceValue
        )
        if (foundCity) {
          setSelectedCity(foundCity.name)
          setLocation(prev => ({ ...prev, cityStateProvince: foundCity.name }))
          found = true
        } else {
          console.warn(
            'Initial city not found in cities list:',
            initialCityStateProvinceValue
          )
        }
      }

      // Đánh dấu đã xử lý sau khi đã thử tìm kiếm
      setInitialLocationSet(true)
      //setInitialCityStateProvinceValue(null) //Xóa dòng này nếu muốn hiển thị lại state/province gốc khi quay về country ban đầu
      console.log('Marked initial data as processed.')
    }
    // Xử lý trường hợp không có giá trị ban đầu hoặc không có state/city để set
    // nhưng states/cities đã load xong (để đánh dấu là đã xử lý)
    else if (selectedCountry && (states.length > 0 || cities.length > 0)) {
      console.log(
        'Marking initial data as processed because states/cities loaded but no initial value or match.'
      )
      setInitialLocationSet(true)
    }
    // Xử lý trường hợp không có state/city nào được trả về từ API
    else if (selectedCountry && states.length === 0 && cities.length === 0) {
      console.log(
        'Marking initial data as processed because country selected but no states/cities found and not loading.'
      )
      setInitialLocationSet(true)
    }

    // Chạy khi states, cities, initialCityStateProvinceValue, hoặc cờ processed thay đổi
  }, [states, cities, initialCityStateProvinceValue, isFetchingLocations])

  const handleContinentChange = (continent: string) => {
    setInitialLocationSet(true) // <<< Đặt cờ là TRUE
    setSelectedContinent(continent)
  }

  const handleCountryChange = (countryIso2: string) => {
    setInitialLocationSet(true) // <<< Đặt cờ là TRUE
    setSelectedCountry(countryIso2)
    setLocation({
      ...location,
      country: filteredCountries.find(c => c.iso2 === countryIso2)?.name || '',
      cityStateProvince: ''
    })
  }

  const handleStateChange = (stateIso2: string) => {
    setInitialLocationSet(true) // <<< Đặt cờ là TRUE
    setSelectedState(stateIso2)
    setLocation({
      ...location,
      cityStateProvince: states.find(s => s.iso2 === stateIso2)?.name || ''
    })
  }

  const handleCityChange = (cityName: string) => {
    setInitialLocationSet(true) // <<< Đặt cờ là TRUE
    setSelectedCity(cityName)
    setLocation({
      ...location,
      cityStateProvince: cityName
    })
  }
  const handleAddTopic = () => {
    if (newTopic.trim() !== '') {
      setTopics([...topics, newTopic.trim()])
      setNewTopic('')
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  const handleDateChange = (
    index: number,
    field: keyof ImportantDateInput,
    value: string
  ) => {
    const newDates = [...dates]
    newDates[index] = {
      ...newDates[index],
      [field]: value
    }
    setDates(newDates)
  }
  const addDate = () => {
    setDates([...dates, { type: '', name: '', fromDate: '', toDate: '' }])
  }

  const removeDate = (index: number) => {
    if (index !== 0) {
      setDates(dates.filter((_, i) => i !== index))
    }
  }
  const handleLocationChange = (field: keyof LocationInput, value: string) => {
    setLocation({
      ...location,
      [field]: value
    })
  }

  const goToNextStep = () => {
    // Add validation for step 1
    if (currentStep === 1) {
      if (
        !title ||
        !acronym ||
        !link ||
        !type ||
        !location.address ||
        dates.some(date => !date.fromDate || !date.toDate || !date.name)
      ) {
        alert('Please complete all required fields in Step 1.')
        return
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions.')
      return
    }

    const conferenceData: ConferenceFormData = {
      title,
      acronym,
      link,
      topics,
      type,
      location,
      dates,
      imageUrl,
      description
    }

    const userData = localStorage.getItem('user')
    if (!userData) {
      console.error('User not logged in')
      alert('Please log in to add new Conference')
      return
    }
    const user = JSON.parse(userData)
    const userId = user.id
    console.log(conferenceData)
    try {
      const response = await fetch(API_ADD_CONFERENCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...conferenceData, userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.message}`
        )
      }

      const addedConference = await response.json()
      console.log('Conference added:', addedConference)

      const localePrefix = pathname.split('/')[1]
      const pathWithLocale = `/${localePrefix}/dashboard?tab=myconferences`

      router.push(pathWithLocale)
    } catch (error: any) {
      console.error('Error adding conference:', error.message)
    }
  }

  const renderStepOne = () => (
    <>
      {/* Step 1 Form Fields (giữ nguyên nội dung) */}
      <div className='sm:col-span-2'>
        <label htmlFor='title' className='block text-sm  '>
          * {t('Conference_Name')}:
        </label>
        <input
          type='text'
          id='title'
          className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-3'>
        <div>
          <label htmlFor='acronym' className='block text-sm  '>
            * {t('Acronym')}:
          </label>
          <input
            type='text'
            id='acronym'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={acronym}
            onChange={e => setAcronym(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor='link' className='block text-sm  '>
            * {t('Link')}:
          </label>
          <input
            type='url'
            id='link'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={link}
            onChange={e => setLink(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor='type' className='block text-sm  '>
            * {t('Type')}:
          </label>
          <select
            id='type'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={type}
            onChange={e =>
              setType(e.target.value as 'offline' | 'online' | 'hybrid')
            }
            required
          >
            <option value='offline'>{t('Offline')}</option>
            <option value='online'>{t('Online')}</option>
            <option value='hybrid'>{t('Hybrid')}</option>
          </select>
        </div>
      </div>

      <div className='sm:col-span-2'>
        <label className='block text-base  '>* {t('Location')}:</label>
        <div className='grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 md:grid-cols-4'>
          {' '}
          {/* Responsive Grid */}
          <div>
            <label htmlFor='address' className='block text-sm  '>
              {t('Address')}:
            </label>
            <input
              type='text'
              id='address'
              className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
              value={location.address}
              onChange={e => handleLocationChange('address', e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor='continent' className='block text-sm'>
              {t('Continent')}:
            </label>
            <select
              id='continent'
              className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
              value={selectedContinent}
              onChange={e => handleContinentChange(e.target.value)}
              required
            >
              <option value=''>{t('Select_Continent')}</option>
              {continentOptions.map(continent => (
                <option key={continent} value={continent}>
                  {continent}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='country' className='block text-sm'>
              {t('Country')}:
            </label>
            <select
              id='country'
              className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
              value={selectedCountry}
              onChange={e => handleCountryChange(e.target.value)}
              required
              disabled={!selectedContinent}
            >
              <option value=''>{t('Select_Country')}</option>
              {filteredCountries.map(country => (
                <option key={country.iso2} value={country.iso2}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='stateOrCity' className='block text-sm'>
              {cities.length > 0 ? `${t('City')}:` : `${t('State_Province')}:`}
            </label>
            <select
              id='stateOrCity'
              className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
              value={states.length > 0 ? selectedState : selectedCity}
              onChange={e =>
                states.length > 0
                  ? handleStateChange(e.target.value)
                  : handleCityChange(e.target.value)
              }
              required
              disabled={!selectedCountry}
            >
              <option value=''>
                {t('Select')}{' '}
                {cities.length > 0
                  ? `${t('City')}:`
                  : `${t('State_Province')}:`}
              </option>
              {states.length > 0
                ? states.map(state => (
                    <option key={state.iso2} value={state.iso2}>
                      {state.name}
                    </option>
                  ))
                : cities.map(city => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
            </select>
          </div>
        </div>
      </div>
      <div className='sm:col-span-2'>
        <label className='block text-sm  '>{t('Important_Dates')}:</label>
        {dates.map((date, index) => (
          // Grid cho Dates: 1 cột mặc định, 2 cột trên sm, 4 cột trên lg
          <div
            key={index}
            className='mt-1 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-4'
          >
            <div>
              <label htmlFor={`name-${index}`} className='block text-sm  '>
                {t('Name')}:
              </label>
              <input
                type='text'
                id={`name-${index}`}
                value={date.name}
                onChange={e => handleDateChange(index, 'name', e.target.value)}
                className={`mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm
                    ${index === 0 ? 'pointer-events-none opacity-50' : ''}`} // Dùng pointer-events-none thay vì readOnly
                required
                disabled={index === 0} // Dùng disabled thay vì readOnly
              />
            </div>
            <div>
              <label htmlFor={`type-${index}`} className='block text-sm'>
                {t('Type')}:
              </label>
              <select
                id={`type-${index}`}
                value={date.type}
                onChange={e => handleDateChange(index, 'type', e.target.value)}
                className={`mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm ${
                  index === 0 ? 'pointer-events-none opacity-50' : ''
                }`}
                disabled={index === 0}
              >
                <option value=''>{t('Select_Type')}</option>
                {dateTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`fromDate-${index}`} className='block text-sm  '>
                {t('Start')}: {/* Đổi label cho ngắn gọn */}
              </label>
              <input
                type='date'
                id={`fromDate-${index}`}
                value={date.fromDate}
                onChange={e =>
                  handleDateChange(index, 'fromDate', e.target.value)
                }
                className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
                required
              />
            </div>
            <div className='relative'>
              {' '}
              {/* Container cho nút xóa */}
              <label htmlFor={`toDate-${index}`} className='block text-sm  '>
                {t('End')}: {/* Đổi label */}
              </label>
              <input
                type='date'
                id={`toDate-${index}`}
                value={date.toDate}
                onChange={e =>
                  handleDateChange(index, 'toDate', e.target.value)
                }
                className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
                required
              />
              {/* Nút xóa: Đặt cạnh input cuối cùng */}
              {index !== 0 && (
                <button
                  type='button'
                  onClick={() => removeDate(index)}
                  className='absolute -right-6 top-1/2 mt-2 -translate-y-1/2 text-red-500 hover:text-red-700 focus:outline-none sm:-right-8' // Điều chỉnh vị trí nút xóa
                  aria-label='Remove date'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type='button'
          onClick={addDate}
          className='mt-4 rounded bg-button px-4 py-2 text-sm font-bold text-button-text hover:bg-button focus:ring-2 focus:ring-button focus:ring-offset-2 hover:focus:outline-none' // Giảm kích thước nút
        >
          {t('Add_Date')}
        </button>
      </div>
      {/* Topics Section: Sắp xếp lại input và button */}
      <div className='sm:col-span-2'>
        {' '}
        {/* Để chiếm toàn bộ chiều rộng trên mobile */}
        <label htmlFor='newTopic' className='block text-sm  '>
          {t('Topics')}:
        </label>
        <div className='mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-3'>
          <input
            type='text'
            id='newTopic'
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            className='flex-grow rounded-md border border-button px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm' // flex-grow để chiếm không gian còn lại
            placeholder='Add a topic'
          />
          <button
            type='button'
            onClick={handleAddTopic}
            className='mt-2 w-full rounded-md bg-button px-4 py-2 text-sm text-button-text hover:bg-button focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 sm:mt-0 sm:w-auto' // w-full trên mobile, w-auto trên sm+
          >
            {t('Add')}
          </button>
        </div>
        {/* Hiển thị topics đã chọn */}
        <div className='mt-3 flex flex-wrap gap-2'>
          {topics.map((topic, index) => (
            <span
              key={index}
              className='inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold '
            >
              {topic}
              <button
                type='button'
                onClick={() => handleRemoveTopic(topic)}
                className='hover: ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-300 focus:bg-gray-400 focus:text-white focus:outline-none'
                aria-label={`Remove ${topic}`}
              >
                <svg
                  className='h-2 w-2'
                  stroke='currentColor'
                  fill='none'
                  viewBox='0 0 8 8'
                >
                  <path
                    strokeLinecap='round'
                    strokeWidth='1.5'
                    d='M1 1l6 6m0-6L1 7'
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      {/* Image URL và Description (giữ nguyên hoặc điều chỉnh grid nếu cần) */}
      <div className='sm:col-span-2'>
        {' '}
        {/* Có thể cho Image URL chiếm 1 cột trên md+ */}
        <label htmlFor='imageUrl' className='block text-sm  '>
          {t('Image_URL')}:
        </label>
        <input
          type='url'
          id='imageUrl'
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className='mt-1 block w-full rounded-md border border-button px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
        />
      </div>
      <div className='sm:col-span-2'>
        <label htmlFor='description' className='block text-sm  '>
          {t('Description')}:
        </label>
        <textarea
          id='description'
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className='mt-1 block w-full rounded-md border border-button px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
        />
      </div>
    </>
  )

  const renderStepTwo = () => (
    // Step 2 Content (giữ nguyên nội dung, Tailwind sẽ tự xuống dòng)
    <div className='space-y-3 sm:col-span-2'>
      {' '}
      {/* Thêm space-y để tạo khoảng cách giữa các dòng */}
      <h2 className='mb-4 text-lg font-semibold sm:text-xl'>
        {t('Review_Information')}
      </h2>
      <p>
        <strong>{t('Conference_Name')}:</strong> {title}
      </p>
      <p>
        <strong>{t('Acronym')}:</strong> {acronym}
      </p>
      <p>
        <strong>{t('Link')}:</strong>{' '}
        <a
          href={link}
          target='_blank'
          rel='noopener noreferrer'
          className='break-all text-button hover:underline'
        >
          {' '}
          {/* break-all để xuống dòng nếu link quá dài */}
          {link}
        </a>
      </p>
      <p>
        <strong>{t('Type')}:</strong> {t(type)}
      </p>
      <p>
        <strong>{t('Address')}:</strong> {location.address}
      </p>
      <p>
        <strong>{t('Continent')}:</strong> {location.continent}
      </p>
      <p>
        <strong>{t('Country')}:</strong> {location.country}
      </p>
      <p>
        <strong>
          {states.length > 0 ? t('State_Province') : t('City')}:{' '}
          {/* Sửa logic hiển thị label */}
        </strong>{' '}
        {location.cityStateProvince}
      </p>
      <div>
        {' '}
        {/* Bọc list dates trong div để dễ quản lý */}
        <strong>{t('Important_Dates')}:</strong>
        <ul className='mt-1 list-disc space-y-1 pl-5'>
          {' '}
          {/* Thêm style cho list */}
          {dates.map((date, index) => (
            <li key={index}>
              {date.name || 'Unnamed Date'}: {date.fromDate || 'N/A'} -{' '}
              {date.toDate || 'N/A'} ({date.type || 'N/A'})
            </li>
          ))}
        </ul>
      </div>
      <div>
        {' '}
        {/* Bọc list topics */}
        <strong>{t('Topics')}:</strong>
        {topics.length > 0 ? (
          <span className='ml-2'>{topics.join(', ')}</span>
        ) : (
          <span className='ml-2 italic text-gray-500'>No topics added</span>
        )}
      </div>
      {imageUrl && (
        <p>
          <strong>{t('Image_URL')}:</strong>{' '}
          <a
            href={imageUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='break-all text-button hover:underline'
          >
            {imageUrl}
          </a>
        </p>
      )}
      <p>
        <strong>{t('Description')}:</strong>{' '}
        {description || (
          <span className='italic text-gray-500'>No description provided</span>
        )}
      </p>
    </div>
  )

  const renderStepThree = () => (
    // Step 3 Content (giữ nguyên nội dung)
    <div className='sm:col-span-2'>
      <h2 className='mb-4 text-lg font-semibold sm:text-xl'>
        {t('Terms_and_Conditions')}
      </h2>
      <div className='mb-4 max-h-60 overflow-y-auto rounded border p-4'>
        {' '}
        {/* Giới hạn chiều cao và cho phép cuộn */}
        <p>
          Bằng cách nhấp vào nút Đăng hội nghị, tôi xác nhận rằng tôi đã đọc,
          hiểu và đồng ý tuân thủ tất cả các điều khoản và điều kiện dành cho
          người tổ chức/đăng tải hội nghị trên nền tảng này. Tôi cũng đồng ý với
          chính sách bảo mật của nền tảng.
        </p>
        {/* Thêm nội dung điều khoản dài hơn nếu cần */}
      </div>
      <label className='flex items-center'>
        <input
          type='checkbox'
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          className='mr-2 h-4 w-4 rounded border-gray-300 text-button focus:ring-button' // Style checkbox
        />
        <span className='text-sm'>
          {t('I_agree_to_the_terms_and_conditions')}
        </span>
      </label>
    </div>
  )

  return (
    <div className='mx-auto  px-4 py-8 sm:px-6 lg:px-8'>
      {' '}
      {/* Container chính */}
      {/* Stepper */}
      <div className='mb-8 sm:mb-10'>
        {/* Luôn hiển thị div chứa stepper */}
        <div className='flex items-center justify-center sm:justify-start'>
          {/* Step 1 */}
          <div
            className={`flex w-full items-center ${currentStep === 1 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 1 ? 'text-button' : ''}`}
          >
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 1 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
            >
              {/* SVG Icon 1 */}
              <svg
                className='h-3.5 w-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 16 12'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M1 5.917 5.724 10.5 15 1.5'
                />
              </svg>
            </span>
            <div className='ml-2 w-full'>
              <h3 className='font-medium leading-tight'>
                {t('Edit_Conference')}
              </h3>
            </div>
            {/* Đường nối ngang - chỉ hiển thị trên lg+ */}
            <div className='mx-2 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
          </div>

          {/* Step 2 */}
          <div
            className={`flex w-full items-center ${currentStep === 2 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 2 ? 'text-button' : ''}`}
          >
            {/* Đường nối ngang - chỉ hiển thị trên lg+ */}
            <div className='mx-2 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 2 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
            >
              {/* SVG Icon 2 */}
              <svg
                className='h-3.5 w-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='currentColor'
                viewBox='0 0 18 20'
              >
                <path d='M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z' />
              </svg>
            </span>
            <div className='ml-2 w-full'>
              <h3 className='font-medium leading-tight'>{t('Review')}</h3>
            </div>
            {/* Đường nối ngang - chỉ hiển thị trên lg+ */}
            <div className='mx-2 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
          </div>

          {/* Step 3 */}
          <div
            className={`flex w-full items-center ${currentStep === 3 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 3 ? 'text-button' : ''}`}
          >
            {/* Đường nối ngang - chỉ hiển thị trên lg+ */}
            <div className='mx-2 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 3 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
            >
              {/* SVG Icon 3 */}
              <svg
                className='h-3.5 w-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='currentColor'
                viewBox='0 0 18 20'
              >
                <path d='M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z' />
              </svg>
            </span>
            <div className='ml-2 w-full'>
              <h3 className='font-medium leading-tight'>{t('Confirmation')}</h3>
            </div>
          </div>
        </div>
      </div>
      {/* Form Content */}
      {/* Grid cho nội dung form: 1 cột mặc định, 2 cột trên sm+ */}
      <form
        onSubmit={handleSubmit}
        className='grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6'
      >
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
        {currentStep === 3 && renderStepThree()}

        {/* Navigation Buttons: Đặt ở cuối, chiếm toàn bộ chiều rộng trên mobile */}
        <div className='col-span-1 mt-6 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-start'>
          {currentStep > 1 && (
            <button
              type='button'
              onClick={goToPreviousStep}
              className='w-full rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-700 focus:outline-none sm:w-auto' // w-full trên mobile, w-auto trên sm+
            >
              {t('Back')}
            </button>
          )}

          {currentStep < 3 && (
            <button
              type='button'
              onClick={goToNextStep}
              className='hover:bg-button-hover w-full rounded bg-button px-4 py-2 text-sm text-button-text focus:outline-none sm:w-auto' // w-full trên mobile, w-auto trên sm+
            >
              {t('Next')}
            </button>
          )}

          {currentStep === 3 && (
            <button
              type='submit'
              // onClick={handleSubmit} // onSubmit của form đã xử lý
              className='hover:bg-button-hover w-full rounded bg-button px-4 py-2 text-sm text-button-text focus:outline-none sm:w-auto' // w-full trên mobile, w-auto trên sm+
              disabled={!agreedToTerms}
            >
              {t('Add_Conference')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
export default ConferenceForm
