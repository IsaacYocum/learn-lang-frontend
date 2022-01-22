import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const LanguagesViewer = ({ setHeaderState }) => {
    const [languages, setLanguages] = useState([])

    useEffect(() => {
        setHeaderState({
            "title": "View Languages"
        })

        axios.get('/api/languages')
            .then(languagesJson => {
                setLanguages(languagesJson.data)
            })
    }, [])

    return (
        <div>
            <ul>
                {languages.map((language, i) => {
                    return (
                        <li key={i}>
                            <Link to={`/languages/viewlanguage/${language.language}`}>
                                {language.language}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default LanguagesViewer
