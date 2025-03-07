import React from 'react'
import Card_option from './card_option'
import {  Stack } from '@chakra-ui/react'
import Groupchat_img from "../../media/img1.jpg"
import Privatechat_img from "../../media/img2.jpg"
import Videocall_img from "../../media/img3.jpg"
import Quiz_img from "../../media/img4.jpg"

const Cards = () => {
    
    return (
        <>
        <Stack direction="row" justifyContent={'space-around'}>
            <Card_option URI ={"chat"}Image = {Groupchat_img} heading={"Group Chat"} content={"A Place for all your groups that connects you wtih your peers."} />
            <Card_option URI ={"chat"}Image = {Privatechat_img} heading={"Private Chat"} content={"A Place for all your personal connects wtih your peers."} />
        </Stack>
        <Stack direction="row" justifyContent={'space-around'} mt={4}>
            <Card_option URI ={"chat"} Image = {Quiz_img} heading={"Quiz"} content={"A Place for solving questions wtih your peers."}/>
            <Card_option URI ={"videocall_landing"} Image = {Videocall_img} heading={"Study"} content={"A Place for studying with your peers on video call."} />
        </Stack>
        </>
    )
}

export default Cards