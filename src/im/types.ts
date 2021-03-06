// import { IAdmin, IMSession, IMessage } from '../../../store/user/types'

export enum MessageType {
  FRIEND_LIST = 1001,
  FRIEND_STATUS = 1002,
  FRIEND_DELETE = 1003,
  SESSION_LIST = 2001,
  SESSION_ADD = 2002,
  SESSION_DELETE = 2003,
  MESSAGE_RECEIVE = 3001,
  MESSAGE_LIST = 3002,
  USER_INFO = 4001,
  ERROR_NEED_LOGIN = 5001,
  VIDEO_ICE_CANDIDATE = 6001,
  VIDEO_OFFER = 6002,
  VIDEO_ANSWER = 6003,
  VIDEO_LEAVE = 6004,
}

type SessionList = {
  type: typeof MessageType.SESSION_LIST
}

type SessionDelete = {
  type: typeof MessageType.SESSION_DELETE
  session_id: string
}

type SessionAdd = {
  type: typeof MessageType.SESSION_ADD
  friend_id: string
}

type FriendList = {
  type: typeof MessageType.FRIEND_LIST
}

type MessageList = {
  type: typeof MessageType.MESSAGE_LIST
  session_id: string
}

type VideoOffer = {
  type: typeof MessageType.VIDEO_OFFER
  data: RTCSessionDescriptionInit
  session_id: string
}

type VideoAnswer = {
  type: typeof MessageType.VIDEO_ANSWER
  data: RTCSessionDescriptionInit
  session_id: string
}

type VideoCandidate = {
  type: typeof MessageType.VIDEO_ICE_CANDIDATE
  data: RTCIceCandidateInit
  session_id: string
}

type VideoLeave = {
  type: typeof MessageType.VIDEO_LEAVE
  session_id: string
}

export type FetchData =
  | SessionList
  | SessionAdd
  | SessionDelete
  | FriendList
  | MessageList
  | VideoOffer
  | VideoAnswer
  | VideoCandidate
  | VideoLeave
