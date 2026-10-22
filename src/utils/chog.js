import { BrowserProvider, Contract } from "ethers";

const CHOG_CONTRACT = "0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763";
const MONAD_RPC = "https://testnet-rpc.monad.xyz"; // Update if mainnet RPC is different

const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

export async function getUserChogs(userAddress) {
  const provider = new BrowserProvider(window.ethereum);
  const contract = new Contract(CHOG_CONTRACT, ABI, provider);

  const balance = await contract.balanceOf(userAddress);
  const count = Number(balance);

  if (count === 0) return [];

  const chogs = [];

  for (let i = 0; i < Math.min(count, 10); i++) { // Limit to 10 for demo
    try {
      const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
      const uri = await contract.tokenURI(tokenId);
      
      // Handle IPFS links
      const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const res = await fetch(metadataUrl);
      const metadata = await res.json();

      const image = metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || "";

      chogs.push({
        id: Number(tokenId),
        name: metadata.name || `Chog #${tokenId}`,
        image,
      });
    } catch (err) {
      console.error("Failed to load token", i, err);
    }
  }

  return chogs;
}
