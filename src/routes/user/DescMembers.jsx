import { useEffect } from "react";
import {
  useGetDescSubscribersPrivilegedQuery,
  useRestrictUserInDescMutation,
} from "../../services/descSubscriptionsApi";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CommunityMembers from "./components/CommunityMember/CommunityMembers";
import { useGetDescQuery } from "../../services/descsApi";

const DescMembers = () => {
  const { descId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  useEffect(() => {
    if (isAuthenticated === undefined) return;
    if (isAuthenticated === false) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated]);
  return (
    <CommunityMembers
      communityId={descId}
      communityType="desc"
      isAuthenticated={isAuthenticated}
      useGetCommunityMembers={useGetDescSubscribersPrivilegedQuery}
      useGetCommunityQuery={useGetDescQuery}
      useRestrictUserInCommunityMutation={useRestrictUserInDescMutation}
    />
  );
};

export default DescMembers;
