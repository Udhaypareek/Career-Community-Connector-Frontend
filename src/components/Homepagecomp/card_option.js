import React from 'react'
import { Button, Card, Image, Text, CardBody, CardFooter, Heading, Stack } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom";




const Card_option = (props) => {
  const Navigate = useNavigate();
  const handleSubmit = () =>{
    Navigate(`/${props.URI}`);
  }
  return (
    <Card maxW="lg" overflow="hidden" mt="3" ml={4}>
      <Image
        src= {props.Image}
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
