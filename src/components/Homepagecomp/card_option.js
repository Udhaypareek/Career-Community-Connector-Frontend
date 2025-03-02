import React from 'react'
import { Button, Card, Image, Text, CardBody, CardFooter, Heading, Stack } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom";




const Card_option = (props) => {
  const Navigate = useNavigate();
  const handleSubmit = () =>{
    Navigate("/chat");
  }
  return (
    <Card maxW="lg" overflow="hidden" mt="3" ml={4}>
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
        alt="Green double couch with wooden legs"
      />
      <CardBody>
        <Stack spacing={1}>
          <Heading size="md">{props.heading}</Heading>
          <Text>
            {props.content}
          </Text>
        </Stack>
      </CardBody>
      <CardFooter>
        <Stack direction="row" spacing={2} >
          <Button variant="solid" onClick={()=>{handleSubmit()}}>Launch</Button>
        </Stack>
      </CardFooter>
    </Card>
  )
}

export default Card_option
