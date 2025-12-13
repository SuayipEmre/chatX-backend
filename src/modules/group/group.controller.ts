import { Request, Response } from 'express';
import { catchAsync } from '../../utils/CatchAsync.js';
import { addToGroup, changeAdmin, createGroup, removeFromGroup, renameGroup } from './group.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/sendResponse.js';
import Group from './group.model.js';


export const addToGroupController = catchAsync(async (req: Request, res: Response) => {
    const { groupId, userId } = req.body

    if (!groupId || !userId) throw new ApiError(400, "groupId and userId are required")

    const group = await addToGroup(groupId, userId)

    sendResponse(res, 201, "User added to group", group)
})


export const removeFromGroupController = catchAsync(async (req: Request, res: Response) => {
    const { groupId, userId } = req.body

    if (!groupId || !userId) throw new ApiError(400, "groupId and userId are required")

    const group = await removeFromGroup(groupId, userId)

    sendResponse(res, 200, "User removed from group", group)
})

export const renameGroupController = catchAsync(async (req: Request, res: Response) => {
    const { groupId, newName } = req.body

    if (!groupId || !newName) throw new ApiError(400, "groupId and newName are required")
    const group = await renameGroup(groupId, newName)
    sendResponse(res, 200, "Group renamed successfully", group)
})

export const createGroupController = catchAsync(async (req: Request, res: Response) => {
    const{groupName, users, adminId} = req.body
    console.log('createGroupController body:', req.body);
    
    if(!groupName || !users || !adminId) throw new ApiError(400, "groupName, users and adminId are required")

    if(!Array.isArray(users)) throw new ApiError(400, "users must be an array of user IDs")
    const {group, chat} = await createGroup(groupName, users, adminId)
    sendResponse(res, 201, "Group created successfully", {group, chat})
})

export const changeGroupAdminController = catchAsync(async (req: Request, res: Response) => {
    const { groupId, newAdminId } = req.body;

    if(!groupId || !newAdminId) throw new ApiError(400, "groupId and newAdminId are required");
    const group = await changeAdmin(groupId, newAdminId);

    sendResponse(res, 200, "Group admin changed successfully", group);
})

export const fetchGroupDetailsController = catchAsync(async (req : Request, res : Response) =>{
    const groupId = (req as any).query.id
    if(!groupId) throw new ApiError(400, "groupId is required")

    const group = await Group.findById({_id:groupId}).populate('users', 'email avatar username')
    
    sendResponse(res, 200, "successfuly fetching the group details", group)
})