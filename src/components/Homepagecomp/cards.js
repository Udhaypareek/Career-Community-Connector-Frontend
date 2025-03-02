import React from 'react'
import Card_option from './card_option'
import {  Stack } from '@chakra-ui/react'

const Cards = () => {
    return (
        <>
        <Stack direction="row" justifyContent={'space-around'} >
            <Card_option heading={"Group Chat"} content={"A Place for all your groups that connects you wtih your peers."} />
            <Card_option heading={"Private Chat"} content={"A Place for all your personal connects wtih your peers."} />
        </Stack>
        <Stack direction="row" justifyContent={'space-around'} mt={4}>
            <Card_option heading={"Quiz"} content={"A Place for solving questions wtih your peers."} />
            <Card_option heading={"Study"} content={"A Place for studying with your peers on video call."} />
        </Stack>
        </>
    )
}

export default Cards