import React, { useEffect, useState, useMemo } from 'react'
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
  const backgroundColor = useMemo(() => {
    if (field.hasError)
      return 'bg/error'
    else if (isEditing)
      return 'bg/container-moderate'
    else
      return 'bg/container-minor'
  }, [isEditing])

  const {
    initialzed,
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
    if (initialzed)
      handleUpdateDependants(field.id)
  }, [field])

  return (
    <Flex
      minWidth='100px'
      bg={backgroundColor}
      justifyContent='center'
      alignItems='center'
      height={40}
      position='relative'
      data-testid={`spreadsheet-field-${field.id}`}
      boxShadow='border/on-focus'
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
