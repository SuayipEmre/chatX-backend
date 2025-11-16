import { Types } from "mongoose"
import { ApiError } from "../../utils/ApiError.js"
import Group from "./group.model.js"

export const addToGroup = async (groupId: string, userId: string) => {
    const group = await Group.findById(groupId)
    if (!group) throw new ApiError(404, 'Group Not found')


    if (group.users.some(u => u.toString() === userId)) {
        throw new ApiError(400, "User already in group");
    }

    group.users.push(new Types.ObjectId(userId))
    await group.save()
    return group
}

export const removeFromGroup = async (groupId: string, userId: string) => {
    const group = await Group.findById(groupId)
    if (!group) throw new ApiError(404, 'Group Not found')


    if (!group.users.some(u => u.toString() === userId)) {
        throw new ApiError(400, "User is not in this group");
    }

    if (group.admin.toString() === userId) throw new ApiError(400, "Group admin cannot be removed from the group")

    group.users = group.users.filter(item => item.toString() != userId)
    await group.save()

    return group
}

export const renameGroup = async (groupId: string, newName: string) => {
    const group = await Group.findById(groupId)
    if (!group) throw new ApiError(404, "Group not found")

    if (!newName || newName.trim().length === 0) throw new ApiError(400, "New group name cannot be empty")

    group.groupName = newName.trim()
    await group.save()

    return group

}


export const createGroup = async (groupName: string, users: string[], adminId: string) => {
    if(!groupName || groupName.trim().length === 0) throw new ApiError(400, "Group name is required");

    if (!users || users.length < 2) throw new ApiError(400, "At least 2 users are required to form a group");
    
    if(!adminId || !users.includes(adminId) ) throw new ApiError(400, "Admin must be part of the group users");

    const group = await Group.create({
        groupName: groupName.trim(),
        users: users.map(id => new Types.ObjectId(id)),
        admin: new Types.ObjectId(adminId),
        isGroupChat: true
    })

    return group
}

export const changeAdmin = async (groupId: string, newAdminId: string) => {
    const group = await Group.findById(groupId)
    if(!group) throw new ApiError(404, "Group not found");

    if(!group.users.some(u => u.toString() === newAdminId)) throw new ApiError(400, "New admin must be a member of the group")

     if(group.admin.toString() === newAdminId) throw new ApiError(400, "User is already the admin of the group");   
    group.admin = new Types.ObjectId(newAdminId);
    await group.save()
    return group
}