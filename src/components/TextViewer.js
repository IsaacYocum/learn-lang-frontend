import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Word from './Word'

const TextViewer = ({ textId, setHeaderState }) => {
    const [text, setText] = useState({})
    const [isLoading, setIsLoading] = useState(true);
    const [anyCharacter, setAnyCharacter] = useState([])
    const [definedWords, setDefinedWords] = useState({});

    useEffect(() => {
        axios.get(`/api/texts/${textId}`)
            .then(resp => {
                setHeaderState({
                    "title": resp.data[0].title,
                    "text": resp.data[0]
                })

                setText(resp.data[0])
                let textData = resp.data[0].text
                console.log('text', typeof textData)
                let any = textData.match(/(\w+| |[.,;:!?’'"()\n]*)/gi)
                console.log(any)
                setAnyCharacter(prev => prev.concat(any))

                let words = textData.match(/\w+/gi)

                // Create a new list without duplicates to send to the DB
                let filteredWords = words.filter((value, index, self) =>
                    index === self.findIndex((t) => (
                        t.toLowerCase().trim() === value.toLowerCase().trim()
                    )))
                console.log("filtered", filteredWords)

                // Front load all word definitions from the DB
                axios.post(`/api/languages/english/getTextWords`, filteredWords)
                    .then(wordsFromDb => {
                        let definedWordsObj = {};
                        wordsFromDb.data.forEach(element => {
                            definedWordsObj[element.word] = element;
                        })
                        setDefinedWords(definedWordsObj)

                        setIsLoading(false)
                    })
            })
    }, [textId])

    if (isLoading) {
        return <p>loading...</p>
    }

    return (
        <div>
            <div className='textBody'>
                {console.log('anyCharacter', anyCharacter)}
                {console.log('definedWords', definedWords)}
                {anyCharacter.map((any, i) => {
                    if (/\w+/gi.test(any)) { // handle words
                        let knownWord = definedWords[any.toLowerCase()]
                        if (knownWord) {
                            let word = {
                                "word": any,
                                "familiarity": knownWord.familiarity,
                                "translation": knownWord.translation
                            }
                            return <Word key={i} wordObj={word} />
                        } else {
                            let unknownWord = {
                                "word": any,
                                "familiarity": 0,
                                "translation": "unknown"
                            }
                            return <Word key={i} wordObj={unknownWord} />
                        }
                    } else if (/\n+/g.test(any)) { // handle new lines
                        return (
                            <span key={i}>
                                <br></br>
                                <br></br>
                            </span>
                        )
                    } else { // handle any other characters such as punctuation
                        return <span key={i}>{any}</span>
                    }
                })}
            </div>
        </div>
    )
}

export default TextViewer
