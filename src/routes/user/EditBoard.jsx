import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useUploadBoardBannerFilesMutation,
  useUploadBoardAvatarFilesMutation,
} from "../../services/fileApi";
import {
  useDeleteBoardAvatarMutation,
  useDeleteBoardBannerMutation,
  useGetBoardQuery,
  useUpdateBoardAvatarMutation,
  useUpdateBoardBannerMutation,
  useUpdateBoardMutation,
  useCheckBoardNameIsAvailableQuery,
} from "../../services/boardsApi";
import EditCommunity from "./components/CommunityMember/EditCommunity";

const EditBoard = () => {
  const { boardId } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <EditCommunity
      communityId={boardId}
      communityType="board"
      isAuthenticated={isAuthenticated}
      useGetCommunityQuery={useGetBoardQuery}
      useUpdateCommunityMutation={useUpdateBoardMutation}
      useUploadCommunityBannerFilesMutation={useUploadBoardBannerFilesMutation}
      useUploadCommunityAvatarFilesMutation={useUploadBoardAvatarFilesMutation}
      useUpdateCommunityAvatarMutation={useUpdateBoardAvatarMutation}
      useUpdateCommunityBannerMutation={useUpdateBoardBannerMutation}
      useDeleteCommunityAvatarMutation={useDeleteBoardAvatarMutation}
      useDeleteCommunityBannerMutation={useDeleteBoardBannerMutation}
      useCheckCommunityNameIsAvailableQuery={useCheckBoardNameIsAvailableQuery}
      communityTypeLabel="Board"
      urlPrefix="b/"
      successMessage="Board updated successfully!"
      getCancelPath={(id) => `/b/${id}`}
      getEditPath={(name) => `/b/${name}/edit`}
      getViewPath={(name) => `/b/${name}`}
    />
  );
};

export default EditBoard;
