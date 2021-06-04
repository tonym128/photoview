import React, { useEffect } from 'react'
import { useMutation, useQuery, gql, useLazyQuery } from '@apollo/client'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import { Popover } from '@headlessui/react'
import {
  sidebareDeleteShare,
  sidebareDeleteShareVariables,
} from './__generated__/sidebareDeleteShare'
import { sidbarGetPhotoShares_media_shares } from './__generated__/sidbarGetPhotoShares'
import {
  sidebarPhotoAddShare,
  sidebarPhotoAddShareVariables,
} from './__generated__/sidebarPhotoAddShare'
import {
  sidebarAlbumAddShare,
  sidebarAlbumAddShareVariables,
} from './__generated__/sidebarAlbumAddShare'
import {
  sidebarGetPhotoShares,
  sidebarGetPhotoSharesVariables,
} from './__generated__/sidebarGetPhotoShares'
import {
  sidebarGetAlbumShares,
  sidebarGetAlbumSharesVariables,
} from './__generated__/sidebarGetAlbumShares'
import { authToken } from '../../helpers/authentication'
import { SidebarSection, SidebarSectionTitle } from './SidebarComponents'

import { ReactComponent as LinkIcon } from './icons/shareLinkIcon.svg'
import { ReactComponent as CopyIcon } from './icons/shareCopyIcon.svg'
import { ReactComponent as DeleteIcon } from './icons/shareDeleteIcon.svg'
import { ReactComponent as MoreIcon } from './icons/shareMoreIcon.svg'
import { ReactComponent as AddIcon } from './icons/shareAddIcon.svg'
import Checkbox from '../../primitives/form/Checkbox'
import { TextField } from '../../primitives/form/Input'
import styled from 'styled-components'

const SHARE_PHOTO_QUERY = gql`
  query sidebarGetPhotoShares($id: ID!) {
    media(id: $id) {
      id
      shares {
        id
        token
        hasPassword
      }
    }
  }
`

const SHARE_ALBUM_QUERY = gql`
  query sidebarGetAlbumShares($id: ID!) {
    album(id: $id) {
      id
      shares {
        id
        token
        hasPassword
      }
    }
  }
`

const ADD_MEDIA_SHARE_MUTATION = gql`
  mutation sidebarPhotoAddShare($id: ID!, $password: String, $expire: Time) {
    shareMedia(mediaId: $id, password: $password, expire: $expire) {
      token
    }
  }
`

const ADD_ALBUM_SHARE_MUTATION = gql`
  mutation sidebarAlbumAddShare($id: ID!, $password: String, $expire: Time) {
    shareAlbum(albumId: $id, password: $password, expire: $expire) {
      token
    }
  }
`

// const PROTECT_SHARE_MUTATION = gql`
//   mutation sidebarProtectShare($token: String!, $password: String) {
//     protectShareToken(token: $token, password: $password) {
//       token
//       hasPassword
//     }
//   }
// `

const DELETE_SHARE_MUTATION = gql`
  mutation sidebareDeleteShare($token: String!) {
    deleteShareToken(token: $token) {
      token
    }
  }
`

// type ShareItemMoreDropdownProps = {
//   id: string
//   query: DocumentNode
//   share: sidbarGetAlbumShares_album_shares
// }

// const ShareItemMoreDropdown = ({
//   id,
//   share,
//   query,
// }: ShareItemMoreDropdownProps) => {
//   const { t } = useTranslation()

//   const [addingPassword, setAddingPassword] = useState(false)
//   const showPasswordInput = addingPassword || share.hasPassword

//   const [passwordInputValue, setPasswordInputValue] = useState(
//     share.hasPassword ? '**********' : ''
//   )
//   const [passwordHidden, setPasswordHidden] = useState(share.hasPassword)

//   const hidePassword = (hide: boolean) => {
//     setPasswordHidden(hide)
//     if (hide) {
//       setPasswordInputValue('**********')
//     }
//   }

//   const [setPassword, { loading: setPasswordLoading }] = useMutation<
//     sidebarProtectShare,
//     sidebarProtectShareVariables
//   >(PROTECT_SHARE_MUTATION, {
//     refetchQueries: [{ query: query, variables: { id } }],
//     onCompleted: data => {
//       hidePassword(data.protectShareToken.hasPassword)
//     },
//     // refetchQueries: [{ query: query, variables: { id } }],
//     variables: {
//       token: share.token,
//     },
//   })

//   let addPasswordInput = null
//   if (showPasswordInput) {
//     const setPasswordEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
//       if (!passwordHidden && passwordInputValue != '' && event.key == 'Enter') {
//         event.preventDefault()
//         setPassword({
//           variables: {
//             token: share.token,
//             password: (event.target as HTMLInputElement).value,
//           },
//         })
//       }
//     }

//     addPasswordInput = (
//       <Input
//         disabled={setPasswordLoading}
//         loading={setPasswordLoading}
//         style={{ marginTop: 8, marginRight: 0, display: 'block' }}
//         onClick={(e: MouseEvent) => e.stopPropagation()}
//         value={passwordInputValue}
//         type={passwordHidden ? 'password' : 'text'}
//         onKeyUp={setPasswordEvent}
//         onChange={event => {
//           hidePassword(false)
//           setPasswordInputValue(event.target.value)
//         }}
//         placeholder="Password"
//         icon={
//           <Icon
//             name={passwordHidden ? 'lock' : 'arrow right'}
//             link={!passwordHidden}
//             onClick={setPasswordEvent}
//           />
//         }
//       />
//     )
//   }

//   const checkboxClick = () => {
//     const enable = !showPasswordInput
//     setAddingPassword(enable)
//     if (!enable) {
//       setPassword({
//         variables: {
//           token: share.token,
//           password: null,
//         },
//       })
//       setPasswordInputValue('')
//     }
//   }

//   // const [dropdownOpen, setDropdownOpen] = useState(false)

//   return (
//     <Dropdown
//       // onBlur={event => {
//       //   console.log('Blur')
//       // }}
//       // onClick={() => setDropdownOpen(state => !state)}
//       // onClose={() => setDropdownOpen(false)}
//       // open={dropdownOpen}
//       button
//       text={t('general.action.more', 'More')}
//       closeOnChange={false}
//       closeOnBlur={false}
//     >
//       <Dropdown.Menu>
//         <Dropdown.Item
//           onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
//           onClick={e => {
//             e.stopPropagation()
//             checkboxClick()
//           }}
//         >
//           <Checkbox
//             label={t('login_page.field.password', 'Password')}
//             onClick={e => e.stopPropagation()}
//             checked={showPasswordInput}
//             onChange={() => {
//               checkboxClick()
//             }}
//           />
//           {addPasswordInput}
//         </Dropdown.Item>
//         {/* <Dropdown.Item
//           text={t('general.action.delete', 'Delete')}
//           icon="delete"
//           disabled={deleteShareLoading}
//           onClick={() => {
//             deleteShare({
//               variables: {
//                 token: share.token,
//               },
//             })
//           }}
//         /> */}
//       </Dropdown.Menu>
//     </Dropdown>
//   )
// }

const ArrowPopoverPanel = styled.div.attrs({
  className:
    'absolute right-6 -top-3 bg-white rounded shadow-md border border-gray-200 w-[260px]',
})`
  &::after {
    content: '';
    position: absolute;
    top: 18px;
    right: -7px;
    width: 8px;
    height: 14px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 14'%3E%3Cpolyline stroke-width='1' stroke='%23E2E2E2' fill='%23FFFFFF' points='1 0 7 7 1 14'%3E%3C/polyline%3E%3C/svg%3E");
  }
`

const MorePopover = () => {
  const { t } = useTranslation()

  return (
    <Popover className="relative">
      <Popover.Button
        className="align-middle p-1 ml-2"
        title={t('sidebar.sharing.more', 'More')}
      >
        <MoreIcon />
      </Popover.Button>

      <Popover.Panel>
        <ArrowPopoverPanel>
          <div className="px-4 py-2">
            <Checkbox label="Password protected" />
            <TextField sizeVariant="small" className="mt-2" />
          </div>
          <div className="px-4 py-2 border-t border-gray-200 mt-2 mb-2">
            <Checkbox label="Expiration date" />
            <TextField sizeVariant="small" className="mt-2" />
          </div>
        </ArrowPopoverPanel>
      </Popover.Panel>
    </Popover>
  )
}

type SidebarShareAlbumProps = {
  id: string
}

export const SidebarAlbumShare = ({ id }: SidebarShareAlbumProps) => {
  const { t } = useTranslation()

  const {
    loading: queryLoading,
    error: sharesError,
    data: sharesData,
  } = useQuery<sidebarGetAlbumShares, sidebarGetAlbumSharesVariables>(
    SHARE_ALBUM_QUERY,
    { variables: { id } }
  )

  const [shareAlbum, { loading: mutationLoading }] = useMutation<
    sidebarAlbumAddShare,
    sidebarAlbumAddShareVariables
  >(ADD_ALBUM_SHARE_MUTATION, {
    refetchQueries: [{ query: SHARE_ALBUM_QUERY, variables: { id } }],
  })

  const loading = queryLoading || mutationLoading

  if (sharesError) {
    return <div>Error: {sharesError.message}</div>
  }

  if (loading) {
    return <div>{t('general.loading.shares', 'Loading shares...')}</div>
  }

  return (
    <SidebarShare
      id={id}
      isPhoto={false}
      loading={loading}
      shares={sharesData?.album.shares}
      shareItem={shareAlbum}
    />
  )
}
type SidebarSharePhotoProps = {
  id: string
}

export const SidebarPhotoShare = ({ id }: SidebarSharePhotoProps) => {
  const { t } = useTranslation()

  const [
    loadShares,
    { loading: queryLoading, error: sharesError, data: sharesData },
  ] =
    useLazyQuery<sidebarGetPhotoShares, sidebarGetPhotoSharesVariables>(
      SHARE_PHOTO_QUERY
    )

  const [sharePhoto, { loading: mutationLoading }] = useMutation<
    sidebarPhotoAddShare,
    sidebarPhotoAddShareVariables
  >(ADD_MEDIA_SHARE_MUTATION, {
    refetchQueries: [{ query: SHARE_PHOTO_QUERY, variables: { id } }],
  })

  useEffect(() => {
    if (authToken()) {
      loadShares({
        variables: {
          id,
        },
      })
    }
  }, [])

  const loading = queryLoading || mutationLoading

  if (sharesError) {
    return <div>Error: {sharesError.message}</div>
  }

  if (loading) {
    return <div>{t('general.loading.shares', 'Loading shares...')}</div>
  }

  return (
    <SidebarShare
      id={id}
      isPhoto={true}
      loading={loading}
      shares={sharesData?.media.shares}
      shareItem={sharePhoto}
    />
  )
}

type SidebarShareProps = {
  id: string
  isPhoto: boolean
  loading: boolean
  shares?: sidbarGetPhotoShares_media_shares[]
  shareItem(item: { variables: { id: string } }): void
}

const SidebarShare = ({
  loading,
  shares,
  isPhoto,
  id,
  shareItem,
}: SidebarShareProps) => {
  const { t } = useTranslation()

  const query = isPhoto ? SHARE_PHOTO_QUERY : SHARE_ALBUM_QUERY

  const [deleteShare] = useMutation<
    sidebareDeleteShare,
    sidebareDeleteShareVariables
  >(DELETE_SHARE_MUTATION, {
    refetchQueries: [{ query: query, variables: { id } }],
  })

  if (shares === undefined) {
    return null
  }

  const optionsRows = shares.map(share => (
    <tr key={share.token} className="border-gray-100 border-b border-t">
      <td className="pl-4 py-2 w-full">
        <span className="text-[#585858] mr-2">
          <LinkIcon className="inline-block mr-2" />
          <span className="text-xs uppercase font-bold">
            {t('sidebar.sharing.public_link', 'Public Link') + ' '}
          </span>
        </span>
        <span className="text-sm">{share.token}</span>
      </td>
      <td className="pr-6 py-2 whitespace-nowrap text-[#5C6A7F] flex">
        <button
          className="align-middle p-1 ml-2"
          title={t('sidebar.sharing.copy_link', 'Copy Link')}
          onClick={() => {
            copy(`${location.origin}/share/${share.token}`)
          }}
        >
          <CopyIcon />
        </button>
        <button
          onClick={() => {
            deleteShare({ variables: { token: share.token } })
          }}
          className="align-middle p-1 ml-2 hover:text-red-600 focus:text-red-600"
          title={t('sidebar.sharing.delete', 'Delete')}
        >
          <DeleteIcon />
        </button>
        <MorePopover />

        {/* <ShareItemMoreDropdown share={share} id={id} isPhoto={isPhoto} /> */}
      </td>
    </tr>
  ))

  if (optionsRows.length == 0) {
    optionsRows.push(
      <tr key="no-shares" className="border-gray-100 border-b border-t">
        <td colSpan={2} className="pl-4 py-2 italic text-gray-600">
          {t('sidebar.sharing.no_shares_found', 'No shares found')}
        </td>
      </tr>
    )
  }

  return (
    <SidebarSection>
      <SidebarSectionTitle>
        {t('sidebar.sharing.title', 'Sharing options')}
      </SidebarSectionTitle>
      <div>
        <table className="border-collapse w-full">
          <tbody>{optionsRows}</tbody>
          <tfoot>
            <tr className="text-left border-gray-100 border-b border-t">
              <td colSpan={2} className="pl-4 py-2">
                <button
                  className="text-[#4ABF3C] font-bold uppercase text-xs"
                  disabled={loading}
                  onClick={() => {
                    shareItem({
                      variables: {
                        id,
                      },
                    })
                  }}
                >
                  <AddIcon className="inline-block mr-2" />
                  <span>{t('sidebar.sharing.add_share', 'Add shares')}</span>
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </SidebarSection>
  )
}
