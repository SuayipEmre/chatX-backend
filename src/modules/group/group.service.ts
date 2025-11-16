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

    if(group.admin.toString() === userId) throw new ApiError(400, "Group admin cannot be removed from the group")

    group.users = group.users.filter(item => item.toString() != userId)
    await group.save()

    return group
}
