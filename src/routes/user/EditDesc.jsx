import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useUploadDescBannerFilesMutation,
  useUploadDescAvatarFilesMutation,
} from "../../services/fileApi";
import {
  useDeleteDescAvatarMutation,
  useDeleteDescBannerMutation,
  useGetDescQuery,
  useUpdateDescAvatarMutation,
  useUpdateDescBannerMutation,
  useUpdateDescMutation,
  useCheckDescNameIsAvailableQuery,
} from "../../services/descsApi";
import EditCommunity from "./components/CommunityMember/EditCommunity";

const EditDesc = () => {
  const { descId } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <EditCommunity
      communityId={descId}
      communityType="desc"
      isAuthenticated={isAuthenticated}
      useGetCommunityQuery={useGetDescQuery}
      useUpdateCommunityMutation={useUpdateDescMutation}
      useUploadCommunityBannerFilesMutation={useUploadDescBannerFilesMutation}
      useUploadCommunityAvatarFilesMutation={useUploadDescAvatarFilesMutation}
      useUpdateCommunityAvatarMutation={useUpdateDescAvatarMutation}
      useUpdateCommunityBannerMutation={useUpdateDescBannerMutation}
      useDeleteCommunityAvatarMutation={useDeleteDescAvatarMutation}
      useDeleteCommunityBannerMutation={useDeleteDescBannerMutation}
      useCheckCommunityNameIsAvailableQuery={useCheckDescNameIsAvailableQuery}
      communityTypeLabel="Desc"
      urlPrefix="d/"
      successMessage="Desc updated successfully!"
      getCancelPath={(id) => `/d/${id}`}
      getEditPath={(name) => `/d/${name}/edit`}
      getViewPath={(name) => `/d/${name}`}
    />
  );
};

export default EditDesc;