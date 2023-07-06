import React, { useEffect, useState } from 'react'
import { Flex, Text, UnStyledInput, UnStyledButton } from '@/design-system'
import { useSpreadSheetContext } from '@/context'
import { EditIcon } from '@/icons'
import { SpreadSheetFieldState } from '@/types'

interface Props {
  field: SpreadSheetFieldState
}

export const SpreadSheetField = React.memo(({ field }: Props) => {
  const { row, column } = field
  const [value, setValue] = useState(field.value)
  const [isEditing, setIsEditting] = useState(false)
  const {
    handleUpdateField,
    handleUpdateDependants
  } = useSpreadSheetContext()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleBlur = () => {
    if (value === field.value)
      return setIsEditting(false)
    handleUpdateField(row, column, value)
    setIsEditting(false)
  }

  useEffect(() => {
    handleUpdateDependants(field.id)
  }, [field])

  return (
    <Flex
      minWidth='100px'
      bg='bg/action-minor'
      border='1px solid #000'
      justifyContent='center'
      alignItems='center'
      height={40}
      position='relative'
    >

      {
        isEditing ? (
          <UnStyledInput
            name={field.id}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ) : (
          <Text variation='label-minor' textAlign='center'>
            {field.display}
          </Text>
        )
      }

      <UnStyledButton
        position='absolute'
        right={10}
        bottom={15}
        onClick={() => setIsEditting(true)}
      >
        <EditIcon />
      </UnStyledButton>
    </Flex>
  )
})
